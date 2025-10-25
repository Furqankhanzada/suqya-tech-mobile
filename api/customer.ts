import { api } from './axios';

const collection = 'customers';

export const updateCustomer = async (customerId: string, body: any) => {
  return (
    await api.patch<any>(`/${collection}/${customerId}`,
      body,
    )
  ).data;
};
