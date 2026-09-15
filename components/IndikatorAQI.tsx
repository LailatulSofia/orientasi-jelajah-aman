import { Text } from "react-native";
import { LaporanUdara } from "../types/cuaca";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  let warna = "green";

  if (data.tingkat === "SEDANG") {
    warna = "orange";
  } else if (data.tingkat === "TIDAK_SEHAT") {
    warna = "red";
  } else if (data.tingkat === "BERBAHAYA") {
    warna = "darkred";
  }

  return (
    <Text style={{ color: warna }}>
      {data.kota}: AQI {data.indeksAQI} - {data.tingkat}
    </Text>
  );
}