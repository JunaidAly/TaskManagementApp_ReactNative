import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore, useOnboardingStore } from '../store';

export default function Index() {
  const [ready, setReady] = useState(false);
  const loadAuth = useAuthStore((s) => s.loadAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadOnboarding = useOnboardingStore((s) => s.loadOnboarding);
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);

  useEffect(() => {
    Promise.all([loadAuth(), loadOnboarding()]).finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  return <Redirect href="/(tabs)" />;
}
