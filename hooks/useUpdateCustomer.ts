import { useMutation } from '@tanstack/react-query';
import { updateCustomer } from '@/api/customer';
import { router } from 'expo-router';

import { CustomerModel } from '@/database/model/Customer';

type UpdateCustomer = {
  updates: Partial<CustomerModel>;
  customer: CustomerModel;
};

export const useUpdateCustomer = () => {
  return useMutation({
    mutationFn: async ({ customer, updates }: UpdateCustomer) => {
      return updateCustomer(customer.id, updates);
    },
    onMutate: async ({ customer, updates }) => {
      // Get existing changed keys
      const existingChangedKeys = customer.changedKeys || '';
      const existingKeysArray = existingChangedKeys.split(',').filter(Boolean);
      
      // Get new keys from current update
      const newKeys = Object.keys(updates);
      
      // Combine existing and new keys, remove duplicates
      const allChangedKeys = Array.from(new Set([...existingKeysArray, ...newKeys]));
      
      const syncUpdates: Partial<CustomerModel> = {
        ...updates,
        changedKeys: allChangedKeys.join(','),
        syncState: 'updated',
      };
      await customer.applyUpdates(syncUpdates);
    },
    onSuccess: async (_, { customer }) => {
      await customer.markAsSynced();
      router.back();
    },
  });
};
