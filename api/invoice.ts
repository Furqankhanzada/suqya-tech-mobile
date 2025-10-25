import qs from 'qs';
import { api } from './axios';

const collection = 'invoice';

export interface Invoice {
  id: string;
  customer: string;
  isLatest: boolean;
}

export interface Payment {
  id: string;
  customer: string;
  invoice: string | Invoice;
  type: 'cash' | 'online';
  amount: number;
  paidAt: string;
  trip?: (string | null);
  comments?: string | null;
}

export interface InvoiceResponse {
  docs: Invoice[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: null | number;
  page: number;
  pagingCounter: number;
  prevPage: null | number;
  totalDocs: number;
  totalPages: number;
}

export type PaymentUpdatePayload = Partial<Omit<Payment, 'id' | 'customer' | 'invoice'>>;
export type PaymentCreatePayload = Omit<Payment, 'id' | 'invoice'>;

export interface PaymentResponse {
  doc: Payment;
  message: string;
}

/**
 * Fetch the latest invoice for a customer
 */
export const fetchLatestInvoice = async (customerId: string): Promise<Invoice | null> => {
  try {
    const query = qs.stringify(
      {
        where: {
          customer: { equals: customerId },
          isLatest: { equals: true },
        },
        depth: 0,
        limit: 1,
      },
      { addQueryPrefix: true },
    );

    const { data } = await api.get<InvoiceResponse>(`/${collection}${query}`);
    
    if (data.totalDocs) {
      return data.docs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching latest invoice:', error);
    throw error;
  }
};

/**
 * Create a new payment
 */
export const createPayment = async (
  payload: PaymentCreatePayload
): Promise<PaymentResponse> => {
  try {
    const { data } = await api.post<PaymentResponse>(
      '/payments',
      payload
    );
    
    return data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Update payment
 */
export const updatePayment = async (
  paymentId: string,
  payload: PaymentUpdatePayload
): Promise<PaymentResponse> => {
  try {
    const { data } = await api.patch<PaymentResponse>(
      `/payments/${paymentId}`,
      payload
    );
    
    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

