import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { type Customer } from '@/api/types';
import { updateCustomer } from '../../api/customer';
import type { CustomerModel } from '../model/Customer';

export const buildCustomer = (customer: Customer) => {
  return {
    id: customer.id,
    name: customer.name,
    coordinates: customer.coordinates,
    area: customer.area,
    block: customer.block,
    address: customer.address,
    contactNumbers: customer.contactNumbers,
    status: customer.status,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    syncState: 'synced',
    changedKeys: null,
  };
};

const buildBodyFromChangedKeys = (
  customer: CustomerModel,
  skipCols: string[] = ['updatedAt', 'syncState'],
): Partial<Customer | null> => {
  if (!customer) return null;

  const changedKeys = (customer.changedKeys ?? '')
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const body: any = {};
  changedKeys.forEach((key) => {
    if (!skipCols.includes(key)) {
      body[key] = (customer as any)[key];
    }
  });

  return body;
};

export const syncOfflineCustomers = async () => {
  const customerCollection = database.get<CustomerModel>('customers');

  const customersToSync = await customerCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();

  if (customersToSync.length) {
    const results = await Promise.allSettled(
      customersToSync.map(async (customer) => {
        const updates = buildBodyFromChangedKeys(customer);
        await updateCustomer(customer.id, updates);
        await customer.markAsSynced();
      }),
    );

    // Collect errors
    const errors = results.filter(
      (r) => r.status === 'rejected',
    ) as PromiseRejectedResult[];

    if (errors.length) {
      console.error('Sync failed for some customers:', errors);
      throw new Error(`Sync failed for ${errors.length} customers`);
    }
  }
};

export async function syncCustomers(customers: Customer[]) {
  try {
    // sync offline customers first
    await syncOfflineCustomers();
    
    const customerCollection = database.get<CustomerModel>('customers');
    
    // 1. Build customer data
    const apiCustomers = customers.map(buildCustomer);
    console.log('apiCustomers', apiCustomers);
    const apiCustomersMap = new Map(apiCustomers.map((c) => [c.id, c]));

    // 2. Fetch local customers
    const localCustomers = await customerCollection.query().fetch();
    const localCustomersMap = new Map(localCustomers.map((c) => [c.id, c]));

    // 3. Partition customers
    const newCustomers = apiCustomers.filter(
      (c: any) => !localCustomersMap.has(c.id),
    );
    const existingCustomers = apiCustomers.filter((c: any) =>
      localCustomersMap.has(c.id),
    );
    const deletedCustomers = localCustomers.filter(
      (c: any) => !apiCustomersMap.has(c.id),
    );

    // 4. Create operations
    const createOperations = newCustomers.map(({ id, ...rest }: any) =>
      customerCollection.prepareCreate((c) => {
        try {
          c._raw = sanitizedRaw({ id: id }, customerCollection.schema);
          Object.assign(c, rest);
        } catch (e) {
          console.log('newCustomers error', e);
        }
      }),
    );

    const updateOperations = existingCustomers.map(({ id, ...rest }: any) => {
      const customer = localCustomersMap.get(id)!;
      return customer.prepareUpdate((c) => Object.assign(c, rest));
    });

    const deleteOperations = deletedCustomers.map((customer) =>
      customer.prepareDestroyPermanently(),
    );

    // 5. Execute operations
    await database.write(async () => {
      await database.batch([...createOperations, ...updateOperations, ...deleteOperations]);
    });

    console.log(`Synced customers: ${newCustomers.length} created, ${updateOperations.length} updated, ${deleteOperations.length} deleted`);
  } catch (e) {
    console.log('error syncCustomers', e);
    throw e;
  }
}
