import type { TripModel } from '../model/Trip';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import { fetchEmployeeTrips} from '@/api/trip';
import { type Trip } from '@/api/types';
import { database } from '@/database';
import { parse } from 'date-fns';
import { syncOfflineTransactions, syncTransactions } from './transaction';

const parseDate = (date: string) =>
  parse(date, 'dd MMM yyyy', new Date()).toISOString();

export const buildTrip = (t: Trip) => {
  return {
    id: t.id,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    tripAt: parseDate(t.tripAt),
    priority: t.priority,
    areas: t.areas,
    blocks: t.blocks,
    employee: t.employee,
    from: t.from,
    bottles: t.bottles,
    status: t.status,
  };
};

export async function syncTrips(employeeId: string | null) {
  if (!employeeId) return;
  try {
    await syncOfflineTransactions();
    const tripCollection = database.get<TripModel>('trips');

    // 1. Fetch from API
    const apiTrips = (await fetchEmployeeTrips(employeeId)).docs.map(buildTrip);

    const apiTripsById = new Map(apiTrips.map((t) => [t.id, t]));

    // 2. Fetch local
    const localTrips = await tripCollection.query().fetch();

    const localTripsById = new Map(localTrips.map((t) => [t.id, t]));

    // 3. Partition
    const tripsToCreate = apiTrips.filter((t) => !localTripsById.has(t.id));
    const tripsToUpdate = apiTrips.filter((t) => localTripsById.has(t.id));
    const tripsToDelete = localTrips.filter((t) => !apiTripsById.has(t.id));

    const create = tripsToCreate.map(({ id, ...rest }) =>
      tripCollection.prepareCreate((t) => {
        try {
          t._raw = sanitizedRaw({ id: id }, tripCollection.schema);
          Object.assign(t, rest);
        } catch (e) {
          console.log('tripsToCreate error', e);
        }
      }),
    );

    const update = tripsToUpdate.map(({ id, ...rest }) => {
      const trip = localTripsById.get(id)!;
      return trip.prepareUpdate((t) => Object.assign(t, rest));
    });

    const remove = tripsToDelete.map((trip) =>
      trip.prepareDestroyPermanently(),
    );

    await database.write(async () => {
      await database.batch([...create, ...update, ...remove]);
    });

    console.log(`Synced trips: ${tripsToCreate.length} created, ${tripsToUpdate.length} updated, ${tripsToDelete.length} deleted`);


    // 4. Sync transactions
    await syncTransactions();

  } catch (e) {
    console.log('error syncTrip', e);
  }
}