import { useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema } from "../../context/ThemeContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
} from "../../services/riwayatStorage";
import { KotaFavorit } from "../../types/favorit";
import { HasilGeocoding } from "../../types/geocoding";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);

  const { warna } = useTema();

  const muatData = useCallback(async () => {
    const [favorit, riwayat] = await Promise.all([
      ambilSemuaFavorit(),
      ambilRiwayatPencarian(),
    ]);

    setDaftarFavorit(favorit);
    setDaftarRiwayat(riwayat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData().catch((err) => {
        console.error("Gagal memuat data riwayat:", err);
      });
    }, [muatData])
  );

  async function prosesHapusFavorit(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapusFavorit(id: number, nama: string) {
    if (Platform.OS === "web") {
      if (window.confirm(`Yakin hapus ${nama} dari favorit?`)) {
        prosesHapusFavorit(id).catch(() => {
          window.alert("Gagal menghapus favorit. Silakan coba lagi.");
        });
      }
      return;
    }

    Alert.alert("Konfirmasi", `Yakin hapus ${nama} dari favorit?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          prosesHapusFavorit(id).catch(() => {
            Alert.alert("Gagal", "Favorit gagal dihapus. Silakan coba lagi.");
          });
        },
      },
    ]);
  }

  async function prosesHapusRiwayat() {
    await hapusRiwayatPencarian();
    setDaftarRiwayat([]);
  }

  function konfirmasiHapusRiwayat() {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin hapus semua riwayat pencarian?")) {
        prosesHapusRiwayat().catch(() => {
          window.alert("Gagal menghapus riwayat pencarian.");
        });
      }
      return;
    }

    Alert.alert("Hapus Riwayat", "Hapus semua riwayat pencarian?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          prosesHapusRiwayat().catch(() => {
            Alert.alert("Gagal", "Riwayat pencarian gagal dihapus.");
          });
        },
      },
    ]);
  }

  function bukaKota(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        kotaId: String(kota.id),
        nama: kota.name,
        latitude: String(kota.latitude),
        longitude: String(kota.longitude),
        negara: kota.country,
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 20, fontWeight: "bold", color: warna.teks, }} >
          Riwayat Pencarian
        </Text>
        <Text style={{ color: warna.teks }}>Maksimal 10 kota terakhir yang dicari.</Text>

        {daftarRiwayat.length === 0 ? (
          <Text>Belum ada riwayat pencarian.</Text>
        ) : (
          <>
            {daftarRiwayat.map((kota, index) => (
              <TouchableOpacity
                key={`${kota.id}-${kota.latitude}-${kota.longitude}`}
                onPress={() => bukaKota(kota)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: warna.teks,
                  }}
                >
                  {index + 1}. {kota.name}
                </Text>
                <Text style={{ color: warna.teksSekunder }}>
                  {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                </Text>
                <Text style={{ color: warna.teksSekunder }}>
                  Ketuk untuk melihat cuaca
                </Text>
              </TouchableOpacity>
            ))}

            <Button
              title="Hapus Semua Riwayat Pencarian"
              onPress={konfirmasiHapusRiwayat}
            />
          </>
        )}

        <View
          style={{
            height: 1,
            backgroundColor: "#D1D5DB",
            marginVertical: 8,
          }}
        />

        <Text style={{ fontSize: 20, fontWeight: "bold", color: warna.teks, }} >
          Kota Favorit
        </Text>
        <Text style={{ color: warna.teks }}>Tersimpan {daftarFavorit.length} kota favorit.</Text>

        {daftarFavorit.length === 0 ? (
          <Text>Belum ada kota favorit.</Text>
        ) : (
          daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text style={{ flex: 1, color: warna.teks }}>
                {kota.nama}
              </Text>
              <Button
                title="Hapus"
                onPress={() =>
                  konfirmasiHapusFavorit(kota.id, kota.nama)
                }
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}