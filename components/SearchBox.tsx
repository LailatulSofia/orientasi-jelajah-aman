import { useState } from "react";
import { View, TextInput } from "react-native";
import { useTema } from "../src/context/ThemeContext";

interface SearchBoxProps {
  onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");
  const { temaGelap } = useTema();

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={temaGelap ? "#94A3B8" : "#757575"}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          backgroundColor: temaGelap ? "#121820" : undefined,
          color: temaGelap ? "#FFFFFF" : undefined,
          borderColor: temaGelap ? "#475569" : undefined,
          borderWidth: 1,
          padding: 8,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
