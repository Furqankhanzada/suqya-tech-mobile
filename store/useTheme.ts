import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

import { ModeType } from '@/components/ui/gluestack-ui-provider';

type ThemeType = ModeType;

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: (Appearance.getColorScheme() as ThemeType) || 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
