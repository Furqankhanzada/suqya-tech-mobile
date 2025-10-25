import { Model, Relation } from '@nozbe/watermelondb';
import {
  field,
  relation,
  date,
  writer,
} from '@nozbe/watermelondb/decorators';
import type { CustomerModel } from './Customer';
import type { TripModel } from './Trip';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';

export type SyncState = 'synced' | 'created' | 'updated' | 'deleted';
export type PaymentType = 'cash' | 'online';

export class PaymentModel extends Model {
  static table = 'payments';

  static associations = {
    customers: { type: 'belongs_to' as const, key: 'customer_id' },
    trips: { type: 'belongs_to' as const, key: 'trip_id' },
  };

  @relation('customers', 'customer_id') customer!: Relation<CustomerModel>;
  @relation('trips', 'trip_id') trip!: Relation<TripModel>;

  @field('invoice') invoice?: string | null;
  @field('type') type!: PaymentType;
  @field('amount') amount!: number;
  @date('paid_at') paidAt!: Date | string;
  @field('comments') comments?: string | null;

  @date('created_at') createdAt!: Date | string;
  @date('updated_at') updatedAt!: Date | string;

  @field('sync_state') syncState!: SyncState;
  @field('changed_keys') changedKeys?: string | null;

  @writer async applyUpdates(updates: Partial<PaymentModel>) {
    await this.update((payment) => {
      Object.assign(payment, updates);
    });
  }

  @writer async markAsSynced(id?: string, invoice?: string) {
    const collection = this.database.get<PaymentModel>('payments');
    await this.update((payment) => {
      if (id) {
        payment._raw = sanitizedRaw({ id }, collection.schema);
      }
      if (invoice) {
        payment.invoice = invoice;
      }
      Object.assign(payment, { syncState: 'synced', changedKeys: null });
    });
  }
}

