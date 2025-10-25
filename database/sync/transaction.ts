import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import {
  fetchTripTransaction,
  updateTransaction,
} from '@/api/transaction';
import { type Transaction } from '@/api/types';
import type { TransactionModel } from '../model/Transactions';
import { syncCustomers } from './customer';

export const buildTransaction = (tx: Transaction) => {
  return {
    id: tx.id as string,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    
    trip: typeof tx.trip === 'object' ? tx.trip.id : tx.trip,

    customer: tx.customer,

    // for better filters in db
    name: tx.customer.name,
    area: tx.customer.area.name,
    address: tx.customer.address,
    block: tx.customer.block.name,

    status: tx.status,
    bottleGiven: tx.bottleGiven,
    bottleTaken: tx.bottleTaken,
    remainingBottles: tx.remainingBottles,
    transactionAt: tx.transactionAt,
    total: tx.total,

    consumptionRate: tx.consumptionRate,
    weeklyConsumption: tx.weeklyConsumption,
    adjustedConsumption: tx.adjustedConsumption,
    daysUntilDelivery: tx.daysUntilDelivery,
    nextDeliveryDate: tx.nextDeliveryDate,
    priority: tx.priority,

    payment: tx.payment,

    syncState: 'synced',
    changedKeys: null,
  };
};

const buildBodyFromChangedKeys = (
  transaction: TransactionModel,
  skipCols: string[] = ['updatedAt', 'syncState'],
): Partial<Transaction | null> => {
  if (!transaction) return null;

  const changedKeys = (transaction.changedKeys ?? '')
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((col) => !skipCols.includes(col));

  if (changedKeys.length === 0) return null;

  return changedKeys.reduce<Record<string, unknown>>((acc, col) => {
    // allow dynamic access
    let value = (transaction as any)[col];
    acc[col] = value;
    return acc;
  }, {});
};

export const syncOfflineTransactions = async () => {
  const transactionCollection = database.get<TransactionModel>('transactions');

  const transactionsToSync = await transactionCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();

  if (transactionsToSync.length) {
    const results = await Promise.allSettled(
      transactionsToSync.map(async (tx) => {
        const updates = buildBodyFromChangedKeys(tx);
        await updateTransaction(tx.id, updates);
        await tx.markAsSynced();
      }),
    );

    // Collect errors
    const errors = results.filter(
      (r) => r.status === 'rejected',
    ) as PromiseRejectedResult[];

    if (errors.length) {
      console.error('Sync failed for some transactions:', errors);
      throw new Error(`Sync failed for ${errors.length} transactions`);
    }
  }
};

export async function syncTransactions() {
  try {
    // sync offline transactions
    await syncOfflineTransactions();

    // get collections
    const transactionCollection = database.get<TransactionModel>('transactions');
    const tripCollection = database.get('trips');

    // 1. Fetch all trips from local database
    const trips = await tripCollection.query().fetch();
    const tripIds = trips.map(trip => trip.id);

    if (tripIds.length === 0) {
      console.log('No trips found to sync transactions for');
      return;
    }

    // 2. Fetch transactions from API for all trips
    const apiTransactions = [];
    for (const tripId of tripIds) {
      const tripApiTransactions = (await fetchTripTransaction(tripId)).docs.map(
        buildTransaction,
      );
      apiTransactions.push(...tripApiTransactions);
    }

    const apiTransactionsMap = new Map(apiTransactions.map((t) => [t.id, t]));

    // 3. Sync customers from transactions
    const uniqueCustomers = Array.from(
      new Map(apiTransactions.map((t: any) => [t.customer.id, t.customer])).values()
    );
    
    await syncCustomers(uniqueCustomers);

    // 4. Fetch local transactions for all trips
    const localTransactions = await transactionCollection.query().fetch();

    const localTransactionsMap = new Map(
      localTransactions.map((t) => [t.id, t]),
    );

    // 5. Partition transactions
    const newTransactions = apiTransactions.filter(
      (t: any) => !localTransactionsMap.has(t.id),
    );

    const existingTransactions = apiTransactions.filter((t: any) =>
      localTransactionsMap.has(t.id),
    );
    
    const deletedTransactions = localTransactions.filter(
      (t: any) => !apiTransactionsMap.has(t.id),
    );

    const createOperations = newTransactions.map(({ id, trip, customer, ...rest }: any) =>
      transactionCollection.prepareCreate((t) => {
        try {
          t._raw = sanitizedRaw({ id: id }, transactionCollection.schema);
          t.trip.id = trip;
          t.customer.id = customer.id;
          Object.assign(t, rest);
        } catch (e) {
          console.log('newTransactions error', e);
        }
      }),
    );

    const updateOperations = existingTransactions.map(({ id, trip, customer, ...rest }: any) => {
      const transaction = localTransactionsMap.get(id)!;
      return transaction.prepareUpdate((t) => Object.assign(t, rest));
    });

    const deleteOperations = deletedTransactions.map((transaction) =>
      transaction.prepareDestroyPermanently(),
    );

    await database.write(async () => {
      await database.batch([...createOperations, ...updateOperations, ...deleteOperations]);
    });

    console.log(`Synced transactions: ${newTransactions.length} created, ${updateOperations.length} updated, ${deleteOperations.length} deleted`);
  } catch (e) {
    console.log('error syncTransaction', e);
  }
}