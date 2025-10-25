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

      if (isNewPayment) {
        // Create new payment locally
        const localPayment = await database.write(async () => {
          return await paymentCollection.create((payment) => {
            Object.assign(payment, params);
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
            Object.assign(payment, params);
          });
        });
        return { localPayment: params.payment };
      }

      // Update synced payment with changed keys tracking
      const existingKeys = (params.payment!.changedKeys || '').split(',').filter(Boolean);
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
        const invoiceId = typeof result.doc.invoice === 'string' 
          ? result.doc.invoice 
          : result.doc.invoice.id;
        await context.localPayment.markAsSynced(result.doc.id, invoiceId);
      } else {
        await context.localPayment.markAsSynced();
      }
    },

    onError: (error: Error) => {
      console.error('Payment operation failed:', error.message);
    },
  });
};

