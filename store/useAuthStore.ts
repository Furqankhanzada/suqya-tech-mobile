import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection, Session, User } from '@/api/auth';

interface AuthState {
  session: Session | null;
  user: User | null;
  userId: string | null;
  collection: Collection | null;
  token: string | null;
  setSession: (session: Session | undefined, user: User, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      userId: null,
      collection: null,
      token: null,

      setSession: (session, user, token) =>
        set({
          session,
          user,
          userId: user.id,
          collection: user.collection,
          token: token,
        }),

      clearSession: () =>
        set({
          session: null,
          user: null,
          userId: null,
          collection: null,
          token: null,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
