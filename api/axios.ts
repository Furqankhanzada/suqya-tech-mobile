import { deleteDatabase } from '@/database/service';
import { useAuthStore } from '@/store/useAuthStore';
import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if ([403].includes(Number(error.response?.status))) {
      const { clearSession } = useAuthStore.getState();
      await deleteDatabase();
      clearSession();
      router.replace('/login');
    }
    return Promise.reject(error);
  },
);
