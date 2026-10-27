// src/services/airQualityService.ts

import { DataKualitasUdara } from "../types/weather";

const BASE_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";
const BATAS_WAKTU_MS = 8000;

export async function ambilKualitasUdara(
  latitude: number,
  longitude: number
): Promise<DataKualitasUdara> {
  const url =
    `${BASE_URL}?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=european_aqi,pm2_5,pm10`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Gagal memuat kualitas udara (status ${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    if (
      !data.current ||
      data.current.european_aqi === undefined ||
      data.current.pm2_5 === undefined ||
      data.current.pm10 === undefined
    ) {
      throw new Error("Data kualitas udara dari API tidak lengkap");
    }

    return {
      indeksAQI: data.current.european_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Permintaan kualitas udara melebihi batas waktu, coba lagi"
      );
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}