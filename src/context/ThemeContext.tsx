import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PilihanTema = "terang" | "gelap" | "sistem";

interface WarnaTema {
  latar: string;
  permukaan: string;
  teks: string;
  teksSekunder: string;
  garis: string;
  utama: string;
  tombolHapus: string;
}

interface ThemeContextType {
  pilihanTema: PilihanTema;
  temaGelap: boolean;
  warna: WarnaTema;
  ubahTema: (tema: PilihanTema) => Promise<void>;
  temaSiap: boolean;
}

const KUNCI_TEMA = "@jelajah_aman:tema";

const WARNA_TERANG: WarnaTema = {
  latar: "#F8FAFC",
  permukaan: "#FFFFFF",
  teks: "#1E293B",
  teksSekunder: "#64748B",
  garis: "#E2E8F0",
  utama: "#477C72",
  tombolHapus: "#64748B",
};

const WARNA_GELAP: WarnaTema = {
  latar: "#121820",
  permukaan: "#1E293B",
  teks: "#F1F5F9",
  teksSekunder: "#CBD5E1",
  garis: "#475569",
  utama: "#86B8AA",
  tombolHapus: "#94A3B8",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const skemaSistem = useColorScheme();

  const [pilihanTema, setPilihanTema] = useState<PilihanTema>("sistem");
  const [temaSiap, setTemaSiap] = useState(false);

  useEffect(() => {
    let aktif = true;

    async function muatTema() {
      try {
        const tersimpan = await AsyncStorage.getItem(KUNCI_TEMA);

        if (
          aktif &&
          (tersimpan === "terang" ||
            tersimpan === "gelap" ||
            tersimpan === "sistem")
        ) {
          setPilihanTema(tersimpan);
        }
      } catch (error) {
        console.error("Gagal memuat tema:", error);
      } finally {
        if (aktif) setTemaSiap(true);
      }
    }

    muatTema();

    return () => {
      aktif = false;
    };
  }, []);

  async function ubahTema(tema: PilihanTema) {
    setPilihanTema(tema);

    try {
      await AsyncStorage.setItem(KUNCI_TEMA, tema);
    } catch (error) {
      console.error("Gagal menyimpan tema:", error);
    }
  }

  const temaGelap =
    pilihanTema === "gelap" ||
    (pilihanTema === "sistem" && skemaSistem === "dark");

  const warna = temaGelap ? WARNA_GELAP : WARNA_TERANG;

  return (
    <ThemeContext.Provider
      value={{
        pilihanTema,
        temaGelap,
        warna,
        ubahTema,
        temaSiap,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTema harus digunakan di dalam ThemeProvider.");
  }

  return context;
}