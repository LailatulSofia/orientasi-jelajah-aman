// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import SearchBox from "../../../components/SearchBox";
import WeatherCard from "../../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan, hapusCacheKota, } from "../../services/cacheRepository";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { simpanRiwayatPencarian } from "../../services/riwayatStorage";
import { useTema } from "../../context/ThemeContext";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const { warna } = useTema();
  const { temaGelap } = useTema();
  
  const params = useLocalSearchParams<{
    kotaId?: string;
    nama?: string;
    latitude?: string;
    longitude?: string;
    negara?: string;
  }>();
  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const { kotaId, nama, latitude, longitude, negara } = params;

    if (!kotaId || !nama || !latitude || !longitude) {
      return;
    }

    const kota: HasilGeocoding = {
      id: Number(kotaId),
      name: nama,
      latitude: Number(latitude),
      longitude: Number(longitude),
      country: negara ?? "",
    };

    pilihKota(kota);

    router.setParams({
      kotaId: undefined,
      nama: undefined,
      latitude: undefined,
      longitude: undefined,
      negara: undefined,
    });
  }, [
    params.kotaId,
    params.nama,
    params.latitude,
    params.longitude,
    params.negara,
  ]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    if (kota.id !== -1) {
      simpanRiwayatPencarian(kota).catch((err) => {
        console.error("Gagal menyimpan riwayat pencarian:", err);
      });
    }
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );

      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan

      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;

      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function prosesHapusCache(kunci: string) {
    await hapusCacheKota(kunci);

    // Perbarui daftar kota tersimpan setelah penghapusan.
    await muatKotaTersimpan();
    // Bersihkan tampilan jika kota yang sedang dibuka ikut dihapus.
    const kotaDihapus = kotaTersimpan.find((k) => k.kunci === kunci);

    if (
      kotaDihapus &&
      kotaTerpilih &&
      kotaTerpilih.latitude === kotaDihapus.latitude &&
      kotaTerpilih.longitude === kotaDihapus.longitude
    ) {
      setHasil(null);
      setKotaTerpilih(null);
    }
  }

  function konfirmasiHapusCache(kunci: string, nama: string) {
    const hapus = () => {
      prosesHapusCache(kunci).catch(() => {
        if (Platform.OS === "web") {
          window.alert("Cache gagal dihapus. Silakan coba lagi.");
        } else {
          Alert.alert("Gagal", "Cache gagal dihapus. Silakan coba lagi.");
        }
      });
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Hapus cache cuaca untuk ${nama} dari perangkat?`)) {
        hapus();
      }
      return;
    }

    Alert.alert(
      "Hapus Cache Kota",
      `Apakah kamu yakin ingin menghapus cache cuaca untuk ${nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: hapus,
        },
      ]
    );
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas."
      );
      return;
    }

    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
      );
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();

    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} />

        <Button
          title="Gunakan Lokasi Saat Ini"
          onPress={gunakanLokasiSaatIni}
        />

        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi}>{pesanLokasi}</Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text style={{ color: temaGelap ? "#FFFFFF" : undefined }}>
              {kota.name}
            </Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold", color: warna.teks }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>

            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 8 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: warna.teks }}>{k.nama}</Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    Ketuk untuk membuka data cuaca
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Hapus Cache"
                  onPress={() => konfirmasiHapusCache(k.kunci, k.nama)}
                  color="#64748B"
                />
              </View>
            ))}

          </View>
        )}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError && (
          <View>
            <Text accessibilityLabel={pesanError}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(
                hasil.kualitasUdara.indeksAQI
              )}
            />

            <Text style={{ fontSize: 12, color: "#888888" }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />

            <Button
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
