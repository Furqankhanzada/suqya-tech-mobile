import { useMutation } from '@tanstack/react-query';
import { updateTransaction } from '@/api/transaction';
import { router } from 'expo-router';

import { TransactionModel } from '@/database/model/Transactions';

type UpdateTransaction = {
  updates: Partial<TransactionModel>;
  transaction: TransactionModel;
};

export const useUpdateTransaction = () => {
  return useMutation({
    mutationFn: async ({ transaction, updates }: UpdateTransaction) => {
      return updateTransaction(transaction.id, updates);
    },
    onMutate: async ({ transaction, updates }) => {
      // Get existing changed keys
      const existingChangedKeys = transaction.changedKeys || '';
      const existingKeysArray = existingChangedKeys.split(',').filter(Boolean);
      
      // Get new keys from current update
      const newKeys = Object.keys(updates);
      
      // Combine existing and new keys, remove duplicates
      const allChangedKeys = Array.from(new Set([...existingKeysArray, ...newKeys]));
      
      const syncUpdates: Partial<TransactionModel> = {
        ...updates,
        changedKeys: allChangedKeys.join(','),
        syncState: 'updated',
      };
      await transaction.applyUpdates(syncUpdates);
    },
    onSuccess: async (_, { transaction }) => {
      await transaction.markAsSynced();
      router.back();
    },
  });
};
