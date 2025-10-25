import { Model } from '@nozbe/watermelondb';
import { date, field, json, children } from '@nozbe/watermelondb/decorators';
import { sanitizer } from '../utils';
import { Area, BlockInfo, Employee } from '@/api/types';

export class TripModel extends Model {
  static table = 'trips';

  static associations = {
    transactions: { type: 'has_many' as const, foreignKey: 'trip_id' },
    payments: { type: 'has_many' as const, foreignKey: 'trip_id' },
  };

  @json('areas', sanitizer) areas!: Area[];

  @children('transactions') transactions: any;
  @children('payments') payments: any;

  @json('blocks', sanitizer) blocks!: BlockInfo[];

  @json('employee', sanitizer) employee!: Employee[];

  @json('priority', sanitizer) priority!: string[];

  @date('created_at') createdAt!: Date;

  @date('updated_at') updatedAt!: Date;

  @field('from') from!: string;

  @field('bottles') bottles!: number;

  @date('trip_at') tripAt!: Date;

  @field('status') status!: string;
}
