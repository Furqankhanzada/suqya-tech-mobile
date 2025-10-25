import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const { token } = useAuthStore();

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/trip" />;
}
