import { useMutation } from '@tanstack/react-query';
import { login, logout, refreshToken, Collection } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';
import { deleteDatabase } from '@/database/service';

type LoginParams = {
  collection: Collection;
  username: string;
  password: string;
};

export const useLogin = () => {
  const { setSession } = useAuthStore();
  return useMutation({
    mutationFn: async ({ collection, username, password }: LoginParams) => {
      return login(collection, username, password);
    },
    onSuccess: (response) => {
      const { user, token } = response;
      const { sessions } = user;
      const session = sessions?.at(-1);
      setSession(session, user, token);
      router.navigate('/trip');
    },
  });
};

export const useLogout = () => {
  const { collection, clearSession } = useAuthStore();
  return useMutation({
    mutationFn: async () => {
      return logout(collection);
    },
    onSuccess: async () => {
      await deleteDatabase();
      clearSession();
      router.replace('/login');
    },
  });
};

export const useRefreshToken = () => {
  const { collection } = useAuthStore();
  return useMutation({
    mutationFn: async () => {
      return refreshToken(collection);
    },
  });
};
