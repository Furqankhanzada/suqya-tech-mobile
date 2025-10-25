import qs from 'qs';
import { api } from './axios';
import type {
  Transaction,
} from './types';

const collection = 'transaction';

export interface TransactionResponse {
  docs: Transaction[];
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

export const fetchTripTransaction = async (
  tripId: string | undefined,
): Promise<TransactionResponse> => {
  const query = qs.stringify(
    {
      where: {
        trip: { equals: tripId },
      },
      limit: 1000,
    },
    { addQueryPrefix: true },
  );

  return (await api.get<TransactionResponse>(`/${collection}${query}`)).data;
};

export const updateTransaction = async (transactionId: string, body: any) => {
  return (
    await api.patch<{ doc: Transaction; message: string }>(
      `/${collection}/endpoint/${transactionId}`,
      body,
    )
  ).data;
};
