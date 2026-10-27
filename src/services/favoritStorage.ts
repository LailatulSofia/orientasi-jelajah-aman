// src/services/favoritStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";
const BATAS_FAVORIT = 10;

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
  return json ? JSON.parse(json) : [];
}

export async function tambahFavorit(
  kota: KotaFavorit
): Promise<void> {
  const daftar = await ambilSemuaFavorit();

  // Jangan menambahkan kota yang sudah menjadi favorit.
  const sudahAda = daftar.some((k) => k.id === kota.id);

  if (sudahAda) {
    throw new Error("SUDAH_FAVORIT");
  }

  // Batasi maksimal 10 kota favorit.
  if (daftar.length >= BATAS_FAVORIT) {
    throw new Error("BATAS_FAVORIT");
  }

  const daftarBaru = [...daftar, kota];

  await AsyncStorage.setItem(
    KUNCI_PENYIMPANAN,
    JSON.stringify(daftarBaru)
  );
}

export async function hapusFavorit(id: number): Promise<void> {
  const daftar = await ambilSemuaFavorit();
  const daftarBaru = daftar.filter((k) => k.id !== id);

  await AsyncStorage.setItem(
    KUNCI_PENYIMPANAN,
    JSON.stringify(daftarBaru)
  );
}
