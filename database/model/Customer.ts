import { Model } from '@nozbe/watermelondb';
import {
  field,
  json,
  date,
  writer,
  children,
} from '@nozbe/watermelondb/decorators';
import { sanitizer } from '../utils';
import type { Coordinates, ContactNumber, Area, BlockInfo } from '@/api/types';

export type SyncState = 'synced' | 'created' | 'updated' | 'deleted';


export class CustomerModel extends Model {
  static table = 'customers';

  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'customer_id' },
    payments: { type: 'has_many' as const, foreignKey: 'customer_id' },
  };

  // Basic Information
  @field('name') name!: string;
  
  // Location Information
  @json('coordinates', sanitizer) coordinates!: Coordinates;
  @json('area', sanitizer) area!: Area;
  @json('block', sanitizer) block?: BlockInfo;
  @field('address') address!: string;
  
  // Contact Information
  @json('contact_numbers', sanitizer) contactNumbers!: ContactNumber[];
  
  // Customer Status
  @field('status') status!: 'active' | 'archive';
  
  // Timestamps
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  
  // Sync Management
  @field('sync_state') syncState!: SyncState;
  @field('changed_keys') changedKeys?: string | null;
  
  // Relations
  @children('transactions') transactions: any;
  @children('payments') payments: any;

  @writer async applyUpdates(updates: Partial<CustomerModel>) {
    await this.update((tx) => {
      Object.assign(tx, updates);
    });
  }

  @writer
  async markAsSynced() {
    await this.update((customer) => {
      Object.assign(customer, { syncState: 'synced', changedKeys: null });
    });
  }
}
