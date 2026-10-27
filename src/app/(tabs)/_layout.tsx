import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTema } from "../../context/ThemeContext";

export default function TabLayout() {
  const { temaGelap, warna } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        // Header halaman
        headerStyle: {
          backgroundColor: warna.permukaan,
        },
        headerTintColor: warna.teks,
        headerTitleStyle: {
          color: warna.teks,
          fontWeight: "600",
        },

        // Menu navigasi bawah
        tabBarStyle: {
          backgroundColor: warna.permukaan,
          borderTopColor: warna.garis,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: temaGelap ? "#FFFFFF" : "#2563EB",
        tabBarInactiveTintColor: warna.teksSekunder,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
