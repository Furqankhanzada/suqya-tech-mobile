import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'customers',
      columns: [
        // Basic Information
        { name: 'name', type: 'string', isIndexed: true },
        
        // Location Information
        { name: 'coordinates', type: 'string', isOptional: true }, // JSON string with latitude/longitude
        { name: 'area', type: 'string', isOptional: true }, // JSON string
        { name: 'block', type: 'string', isOptional: true }, // JSON string
        { name: 'address', type: 'string', isOptional: true }, // customer address
        
        // Contact Information
        { name: 'contact_numbers', type: 'string', isOptional: true }, // JSON string array
        
        // Customer Status
        { name: 'status', type: 'string' },
        
        // Timestamps
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        
        // Sync Management
        { name: 'sync_state', type: 'string' },
        { name: 'changed_keys', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'payments',
      columns: [
        // Relations
        { name: 'customer_id', type: 'string', isIndexed: true },
        { name: 'trip_id', type: 'string', isOptional: true, isIndexed: true },
        
        // Payment Information
        { name: 'invoice', type: 'string', isIndexed: true, isOptional: true },
        { name: 'type', type: 'string' }, // 'cash' | 'online'
        { name: 'amount', type: 'number' },
        { name: 'paid_at', type: 'number' },
        { name: 'comments', type: 'string', isOptional: true },
        
        // Timestamps
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        
        // Sync Management
        { name: 'sync_state', type: 'string' },
        { name: 'changed_keys', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'trips',
      columns: [
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'from', type: 'string' },
        { name: 'areas', type: 'string' },
        { name: 'blocks', type: 'string' },
        { name: 'bottles', type: 'number' },
        { name: 'trip_at', type: 'number' },
        { name: 'employee', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        // trip relation id
        { name: 'trip_id', type: 'string', isIndexed: true },

        // customer relation id
        { name: 'customer_id', type: 'string', isIndexed: true },

        { name: 'status', type: 'string' },
        { name: 'name', type: 'string', isIndexed: true }, // customer name
        { name: 'area', type: 'string', isOptional: true }, // customer area
        { name: 'address', type: 'string', isOptional: true }, // customer address
        { name: 'block', type: 'string', isOptional: true }, // customer block
        { name: 'bottle_given', type: 'number' },
        { name: 'bottle_taken', type: 'number' },
        { name: 'remaining_bottles', type: 'number', isOptional: true },

        { name: 'transaction_at', type: 'number' },
        { name: 'total', type: 'number', isOptional: true },

        { name: 'consumption_rate', type: 'number', isOptional: true },
        { name: 'weekly_consumption', type: 'number', isOptional: true },
        { name: 'adjusted_consumption', type: 'number', isOptional: true },
        { name: 'days_until_delivery', type: 'number', isOptional: true },
        { name: 'next_delivery_date', type: 'number', isOptional: true },
        { name: 'priority', type: 'string', isOptional: true },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },

        { name: 'sync_state', type: 'string' },
        { name: 'changed_keys', type: 'string', isOptional: true },
      ],
    }),
  ],
});
