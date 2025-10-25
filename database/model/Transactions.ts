import { Model, Relation } from '@nozbe/watermelondb';
import {
  field,
  relation,
  date,
  writer,
} from '@nozbe/watermelondb/decorators';
import type { TripModel } from './Trip';
import type { CustomerModel } from './Customer';
import { Priority } from '@/api/types';

export type SyncState = 'synced' | 'created' | 'updated' | 'deleted';

export class TransactionModel extends Model {
  static table = 'transactions';

  static associations = {
    trips: { type: 'belongs_to' as const, key: 'trip_id' },
    customer: { type: 'belongs_to' as const, key: 'customer_id' },
  };

  @relation('trips', 'trip_id') trip!: Relation<TripModel>;
  @relation('customers', 'customer_id') customer!: Relation<CustomerModel>;

  @field('status') status!: string;
  @field('name') name!: string; // customer name
  @field('area') area!: string; // customer area
  @field('address') address!: string; // customer address
  @field('block') block!: string; // customer block
  @field('bottle_given') bottleGiven!: number;
  @field('bottle_taken') bottleTaken!: number;
  @field('remaining_bottles') remainingBottles!: number;

  @field('total') total!: number;

  @field('consumption_rate') consumptionRate!: number;
  @field('weekly_consumption') weeklyConsumption!: number;
  @field('adjusted_consumption') adjustedConsumption!: number;
  @field('days_until_delivery') daysUntilDelivery!: number;

  @field('priority') priority!: Priority;

  @date('transaction_at') transactionAt!: Date | string;
  @date('next_delivery_date') nextDeliveryDate!: Date | string;
  @date('created_at') createdAt!: Date | string;
  @date('updated_at') updatedAt!: Date | string;

  @field('sync_state') syncState!: SyncState;
  @field('changed_keys') changedKeys?: string | null;

  @writer async applyUpdates(updates: Partial<TransactionModel>) {
    await this.update((tx) => {
      Object.assign(tx, updates);
    });
  }

  @writer async markAsSynced() {
    await this.update((tx) => {
      Object.assign(tx, { syncState: 'synced', changedKeys: null });
    });
  }
}
