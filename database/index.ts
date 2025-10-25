import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema/app';
import migrations from './schema/migrations';
import { TripModel } from './model/Trip';
import { TransactionModel } from './model/Transactions';
import { CustomerModel } from './model/Customer';
import { PaymentModel } from './model/Payment';

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  migrations,
  // (optional database name or file system path)
  dbName: 'suqya-tech-db',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)
  onSetUpError: (error) => {
    console.log('onSetUpError', error);
    // Database failed to load -- offer the user to reload the app or log out
  },
});

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [TripModel, TransactionModel, CustomerModel, PaymentModel],
});
