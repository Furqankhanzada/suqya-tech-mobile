import { useAuthStore } from '@/store/useAuthStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Redirect, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppLayout() {
  const { token } = useAuthStore();

  if (!token) {
    return <Redirect href="/login" />;
  }
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}
