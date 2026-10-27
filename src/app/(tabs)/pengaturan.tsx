import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { hapusSemuaCache } from "../../services/cacheRepository";
import { useTema, PilihanTema } from "../../context/ThemeContext";

const PILIHAN_TEMA: {
  nilai: PilihanTema;
  label: string;
  ikon: keyof typeof Ionicons.glyphMap;
}[] = [
  { nilai: "terang", label: "Terang", ikon: "sunny-outline" },
  { nilai: "gelap", label: "Gelap", ikon: "moon-outline" },
  { nilai: "sistem", label: "Sistem", ikon: "phone-portrait-outline" },
];

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);

  const { pilihanTema, temaGelap, warna, ubahTema } = useTema();

  async function pilihTema(tema: PilihanTema) {
    await ubahTema(tema);
  }

  async function prosesHapusCache() {
    if (sedangMenghapus) return;

    setSedangMenghapus(true);
    setPesan(null);

    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan berhasil dihapus.");
    } catch {
      setPesan("Data cuaca gagal dihapus. Silakan coba lagi.");
    } finally {
      setSedangMenghapus(false);
    }
  }

  function konfirmasiHapusCache() {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus semua data cuaca tersimpan?")) {
        prosesHapusCache();
      }
      return;
    }

    Alert.alert(
      "Hapus Data Cuaca",
      "Semua cache cuaca yang tersimpan akan dihapus. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            prosesHapusCache();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: warna.latar }}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 5 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
              color: warna.teks,
            }}
          >
            Pengaturan
          </Text>

          <Text style={{ fontSize: 14, color: warna.teksSekunder }}>
            Sesuaikan tampilan dan kelola data aplikasi.
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: warna.utama,
            }}
          >
            <Ionicons name="partly-sunny-outline" size={29} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: warna.teks,
              }}
            >
              Jelajah Aman
            </Text>
            <Text style={{ fontSize: 13, color: warna.teksSekunder }}>
              Versi 1.0.0
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: warna.garis,
            backgroundColor: warna.permukaan,
            gap: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons
              name="color-palette-outline"
              size={23}
              color={warna.utama}
            />
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: warna.teks,
                }}
              >
                Tema Tampilan
              </Text>
              <Text style={{ fontSize: 13, color: warna.teksSekunder }}>
                Pilih tampilan sesuai preferensimu.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {PILIHAN_TEMA.map((item) => {
              const aktif = pilihanTema === item.nilai;

              return (
                <Pressable
                  key={item.nilai}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: aktif }}
                  accessibilityLabel={`Tema ${item.label}`}
                  onPress={() => pilihTema(item.nilai)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 100,
                    paddingVertical: 13,
                    paddingHorizontal: 4,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    borderWidth: 1.5,
                    borderColor: aktif ? warna.utama : warna.garis,
                    borderRadius: 13,
                    backgroundColor: aktif
                      ? temaGelap
                        ? "#293B4C"
                        : "#EFF6FF"
                      : warna.permukaan,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: aktif ? warna.utama : warna.latar,
                    }}
                  >
                    <Ionicons
                      name={item.ikon}
                      size={21}
                      color={aktif ? "#FFFFFF" : warna.teksSekunder}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      fontSize: 12,
                      fontWeight: aktif ? "700" : "500",
                      color: warna.teks,
                    }}
                  >
                    {item.label}
                  </Text>

                  <View
                    style={{
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {aktif && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={warna.utama}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: warna.garis,
            backgroundColor: warna.permukaan,
            gap: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: warna.latar,
              }}
            >
              <Ionicons
                name="server-outline"
                size={22}
                color={warna.utama}
              />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: warna.teks,
                }}
              >
                Penyimpanan Data
              </Text>
              <Text style={{ fontSize: 13, color: warna.teksSekunder }}>
                Kelola data cuaca yang tersimpan di perangkat.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={konfirmasiHapusCache}
            disabled={sedangMenghapus}
            style={{
              minHeight: 46,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: warna.garis,
              backgroundColor: warna.latar,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              opacity: sedangMenghapus ? 0.6 : 1,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={warna.teks}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: warna.teks,
              }}
            >
              {sedangMenghapus ? "Menghapus data..." : "Hapus Cache Cuaca"}
            </Text>
          </Pressable>

          {pesan && (
            <Text
              accessibilityLabel={pesan}
              style={{
                fontSize: 13,
                color: warna.teksSekunder,
              }}
            >
              {pesan}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
