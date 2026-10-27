import { useState } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  function tampilkanPeringatan(judul: string, pesan: string) {
    if (Platform.OS === "web") {
      window.alert(`${judul}\n\n${pesan}`);
    } else {
      Alert.alert(judul, pesan);
    }
  }

  async function simpan() {
    if (sedangMenyimpan) return;

    setSedangMenyimpan(true);

    try {
      await tambahFavorit({
        id: Number(id),
        nama: String(nama ?? ""),
        latitude: Number(lat),
        longitude: Number(lon),
      });

      tampilkanPeringatan(
        "Berhasil",
        `${nama} berhasil ditambahkan ke daftar favorit.`
      );

      router.back();
    } catch (err) {
      if (err instanceof Error && err.message === "BATAS_FAVORIT") {
        tampilkanPeringatan(
          "Batas Favorit Tercapai",
          "Maksimal 10 kota favorit. Hapus salah satu kota sebelum menambahkan yang baru."
        );
      } else if (err instanceof Error && err.message === "SUDAH_FAVORIT") {
        tampilkanPeringatan(
          "Sudah Tersimpan",
          `${nama} sudah ada di daftar favorit.`
        );
      } else {
        tampilkanPeringatan(
          "Gagal",
          "Kota gagal ditambahkan ke favorit. Silakan coba lagi."
        );
      }
    } finally {
      setSedangMenyimpan(false);
    }
  }

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <Text>Tambahkan {nama} ke daftar favorit?</Text>

      <Button
        title={sedangMenyimpan ? "Menyimpan..." : "Simpan"}
        onPress={simpan}
        disabled={sedangMenyimpan}
      />
    </View>
  );
}