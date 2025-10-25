import { useAuthStore } from '@/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Redirect href="/trip" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
