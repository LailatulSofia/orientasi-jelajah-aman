import { View, Text } from "react-native";
import { typeScale, spacing } from "../../../constants/styles";
import { useTema } from "../../context/ThemeContext";

export default function Tentang() {
  const { warna } = useTema();

  return (
    <View
      style={{
        flex: 1,
        padding: spacing.sedang,
        backgroundColor: warna.latar,
      }}
    >
      <Text
        accessibilityLabel="Tentang aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          marginBottom: spacing.kecil,
          color: warna.teks,
        }}
      >
        Jelajah Aman
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: warna.teksSekunder,
        }}
      >
        Versi 1.0.0
      </Text>

      <Text
        style={{
          fontSize: typeScale.isi,
          color: warna.teks,
        }}
      >
        Pembuat: Lailatul Sofia
      </Text>
    </View>
  );
}