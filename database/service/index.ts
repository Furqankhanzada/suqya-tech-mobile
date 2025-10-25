import { database } from '@/database';

export const deleteDatabase = async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
};
