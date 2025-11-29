import { useMutation } from '@tanstack/react-query';
import {
  createPayment,
  updatePayment,
  PaymentUpdatePayload,
} from '@/api/invoice';
import { PaymentModel } from '@/database/model/Payment';
import { database } from '@/database';

type PaymentParams = {
  customer: string;
  type: 'cash' | 'online';
  amount: number;
  paidAt: string;
  trip: string;
  comments?: string | null;
  payment?: PaymentModel; // If provided, this is an update/sync operation
};

export const usePayment = () => {
  const paymentCollection = database.get<PaymentModel>('payments');

  return useMutation({
    mutationFn: async (params: PaymentParams) => {
      const isUnsyncedPayment = params.payment?.syncState === 'created';
      const isSyncedPaymentUpdate = params.payment && !isUnsyncedPayment;

      if (isSyncedPaymentUpdate) {
        const updates: PaymentUpdatePayload = {
          type: params.type,
          amount: params.amount,
          comments: params.comments,
        };
        const result = await updatePayment(params.payment!.id, updates);
        return { type: 'update' as const, doc: result.doc };
      }

      const result = await createPayment(params);
      return { type: 'create' as const, doc: result.doc };
    },

    onMutate: async (params) => {
      const isNewPayment = !params.payment;
      const isUnsyncedPayment = params.payment?.syncState === 'created';

      const { customer, trip, payment: _ignored, ...safeFields } = params;

      if (isNewPayment) {
        // Create new payment locally
        const localPayment = await database.write(async () => {
          return await paymentCollection.create((payment) => {
            Object.assign(payment, safeFields);
            (payment as any).customerId = customer;
            (payment as any).tripId = trip;
            payment.syncState = 'created';
            payment.changedKeys = null;
          });
        });
        return { localPayment };
      }

      if (isUnsyncedPayment) {
        // Update unsynced payment before sync
        await database.write(async () => {
          await params.payment!.update((payment) => {
            Object.assign(payment, safeFields);
            (payment as any).customerId = customer;
            (payment as any).tripId = trip;
          });
        });
        return { localPayment: params.payment };
      }

      // Update synced payment with changed keys tracking
      const existingKeys = (params.payment!.changedKeys || '')
        .split(',')
        .filter(Boolean);
      const newKeys = ['type', 'amount', 'comments'];
      const allChangedKeys = Array.from(new Set([...existingKeys, ...newKeys]));

      await database.write(async () => {
        await params.payment!.update((payment) => {
          payment.type = params.type;
          payment.amount = params.amount;
          payment.comments = params.comments;
          payment.changedKeys = allChangedKeys.join(',');
          payment.syncState = 'updated';
        });
      });

      return { localPayment: params.payment };
    },

    onSuccess: async (result, _, context) => {
      if (!context?.localPayment) return;

      if (result.type === 'create') {
        const doc = result.doc as any;

        const invoice = doc?.invoice;
        let invoiceId: string | undefined;

        if (typeof invoice === 'string') {
          invoiceId = invoice;
        } else if (invoice && typeof invoice === 'object' && 'id' in invoice) {
          invoiceId = invoice.id;
        }

        if (invoiceId) {
          await context.localPayment.markAsSynced(doc.id, invoiceId);
        } else {
          await context.localPayment.markAsSynced(doc.id);
        }
      } else {
        await context.localPayment.markAsSynced();
      }
    },

    onError: (error: Error) => {
      console.error('Payment operation failed:', error.message);
    },
  });
};
