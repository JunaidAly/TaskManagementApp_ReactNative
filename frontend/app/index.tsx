import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login screen by default
  // You can add logic here to check if user is authenticated
  // and redirect to (tabs) if they are
  return <Redirect href="/auth/login" />;
}
