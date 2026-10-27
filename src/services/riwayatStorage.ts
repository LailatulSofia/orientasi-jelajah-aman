// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HasilGeocoding } from "../types/geocoding";

const KUNCI_PENYIMPANAN = "@jelajah_aman:riwayat_pencarian";
const BATAS_RIWAYAT = 10;

// Mengurutkan operasi penyimpanan agar tidak saling menimpa.
let antreanPenyimpanan: Promise<void> = Promise.resolve();

export async function ambilRiwayatPencarian(): Promise<HasilGeocoding[]> {
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);

  if (!json) return [];

  try {
    const data: HasilGeocoding[] = JSON.parse(json);

    if (!Array.isArray(data)) return [];

    const terbatas = data.slice(0, BATAS_RIWAYAT);

    // Rapikan penyimpanan lama jika ternyata berisi lebih dari 10 kota.
    if (data.length > BATAS_RIWAYAT) {
      await AsyncStorage.setItem(
        KUNCI_PENYIMPANAN,
        JSON.stringify(terbatas)
      );
    }

    return terbatas;
  } catch {
    return [];
  }
}

export function simpanRiwayatPencarian(
  kota: HasilGeocoding
): Promise<void> {
  if (kota.id === -1) return Promise.resolve();

  const operasi = antreanPenyimpanan.then(async () => {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);

    let daftar: HasilGeocoding[] = [];

    if (json) {
      try {
        const data: unknown = JSON.parse(json);

        if (Array.isArray(data)) {
          daftar = data as HasilGeocoding[];
        }
      } catch {
        daftar = [];
      }
    }

    const daftarTanpaDuplikat = daftar.filter(
      (item) =>
        !(
          item.id === kota.id &&
          item.latitude === kota.latitude &&
          item.longitude === kota.longitude
        )
    );

    const daftarBaru = [kota, ...daftarTanpaDuplikat].slice(
      0,
      BATAS_RIWAYAT
    );

    await AsyncStorage.setItem(
      KUNCI_PENYIMPANAN,
      JSON.stringify(daftarBaru)
    );
  });

  antreanPenyimpanan = operasi.catch(() => {});
  return operasi;
}

export async function hapusRiwayatPencarian(): Promise<void> {
  await antreanPenyimpanan;
  await AsyncStorage.removeItem(KUNCI_PENYIMPANAN);
}