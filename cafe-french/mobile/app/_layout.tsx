// Root Layout - App Entry Point

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { initializeAuth, useAuthStore } from '../src/store/authStore';
import { colors } from '../src/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const { isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize auth state from storage
        await initializeAuth();
      } catch (e) {
        console.warn('Error initializing auth:', e);
      } finally {
        setLoading(false);
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady && !isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady, isLoading]);

  if (!appReady || isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="lesson" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="conversation" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="pronunciation" options={{ presentation: 'modal' }} />
          <Stack.Screen name="flashcards" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
