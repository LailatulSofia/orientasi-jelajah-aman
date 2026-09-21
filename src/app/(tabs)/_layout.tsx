// import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useColorScheme } from 'react-native';

// import { AnimatedSplashOverlay } from '@/components/animated-icon';
// import AppTabs from '@/components/app-tabs';

// SplashScreen.preventAutoHideAsync();

import { Tabs } from "expo-router"; 

export default function TabLayout() {
  // const colorScheme = useColorScheme();
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Beranda" }} />
      <Tabs.Screen name="riwayat" options={{ title: "Riwayat" }} />
      <Tabs.Screen name="pengaturan" options={{ title: "Pengaturan" }} />
    </Tabs> 
  );
}
