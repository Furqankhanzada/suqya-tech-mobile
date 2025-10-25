import { database } from '@/database';
import { TransactionModel } from '../model/Transactions';
import { Q } from '@nozbe/watermelondb';
import { Priority } from '@/api/types';
import { isWeb } from '@gluestack-ui/utils/nativewind-utils';

export const defaultCounts = {
  ALL: 0,
  URGENT: 0,
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0,
};

export const fetchPriorityCounts = async (tripId: string) => {
  try {
    const db = database.get<TransactionModel>('transactions');
    const nativeRawQuery = `SELECT priority, COUNT(*) as count FROM transactions WHERE trip_id = ? GROUP BY priority`;

    if (isWeb) {
      const transactions = await db.query(Q.where('trip_id', tripId)).fetch();
      const counts = transactions.reduce(
        (acc, tx) => {
          acc.ALL += 1;
          const prio = tx.priority;
          if (prio && acc[prio] !== undefined) {
            acc[prio] += 1;
          }
          return acc;
        },
        { ALL: 0, URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      );

      return counts;
    }

    const query = db.query(Q.unsafeSqlQuery(nativeRawQuery, [tripId]));
    const results = await query.unsafeFetchRaw();

    const counts = { ...defaultCounts };

    for (const row of results) {
      const priority = row.priority as Priority;
      const count = Number(row.count) || 0;

      if (priority && priority in counts) {
        counts[priority] = count;
        counts.ALL += count;
      }
    }
    return counts;
  } catch (error) {
    return { ALL: 0, URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  }
};

export const fetchTransactionsObservable = (
  tripId: string,
  priority: Priority,
  search: string,
) => {
  const filters: Q.Clause[] = [
    Q.where('trip_id', tripId),
    Q.sortBy('created_at', Q.desc),
  ];

  if (priority !== 'ALL') {
    filters.push(Q.where('priority', priority));
  }

  if (search) {
    filters.push(
      Q.or(
        Q.where('name', Q.like(`%${Q.sanitizeLikeString(search)}%`)),
        Q.where('area', Q.like(`%${Q.sanitizeLikeString(search)}%`)),
        Q.where('block', Q.like(`%${Q.sanitizeLikeString(search)}%`)),
        Q.where('address', Q.like(`%${Q.sanitizeLikeString(search)}%`)),
      ),
    );
  }

  return database
    .get<TransactionModel>('transactions')
    .query(...filters)
    .observe();
};
