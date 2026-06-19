"use client";

import { useEffect, useMemo, useState } from "react";
import type { VisualSatellite } from "@/features/mission-control/components/EarthViewport";

type CelesTrakRecord = {
  OBJECT_NAME?: string;
  NORAD_CAT_ID?: number;
  EPOCH?: string;
  MEAN_MOTION?: number;
  INCLINATION?: number;
  RA_OF_ASC_NODE?: number;
};

type CelesTrakApiResponse = {
  records: CelesTrakRecord[];
  error: string | null;
};

type SatelliteDataState =
  | { status: "loading"; satellites: VisualSatellite[]; updatedAt: null; message: string }
  | { status: "ready"; satellites: VisualSatellite[]; updatedAt: string | null; message: string }
  | { status: "fallback"; satellites: VisualSatellite[]; updatedAt: null; message: string };

const CELESTRAK_STATIONS_URL =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=JSON";
const CELESTRAK_STATIONS_PROXY = "/data/celestrak/stations";

const EARTH_RADIUS_KM = 6378.137;
const EARTH_MU_KM3_S2 = 398600.4418;

export function useRealSatellites(): SatelliteDataState {
  const [records, setRecords] = useState<CelesTrakRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSatellites() {
      try {
        const response = await fetch(CELESTRAK_STATIONS_PROXY, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`CelesTrak request failed with ${response.status}`);
        }

        const payload = (await response.json()) as CelesTrakApiResponse;
        if (payload.error) {
          throw new Error(payload.error);
        }

        setRecords(payload.records);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn(error);
          setFailed(true);
        }
      }
    }

    loadSatellites();

    return () => controller.abort();
  }, []);

  return useMemo(() => {
    if (failed) {
      return {
        status: "fallback",
        satellites: [],
        updatedAt: null,
        message: "Real satellite data unavailable. Showing Earth scene without invented orbital tracks.",
      };
    }

    if (!records) {
      return {
        status: "loading",
        satellites: [],
        updatedAt: null,
        message: "Loading real satellite data from CelesTrak...",
      };
    }

    const satellites = records
      .filter(
        (record) =>
          record.OBJECT_NAME &&
          typeof record.NORAD_CAT_ID === "number" &&
          typeof record.MEAN_MOTION === "number" &&
          typeof record.INCLINATION === "number" &&
          typeof record.RA_OF_ASC_NODE === "number",
      )
      .slice(0, 5)
      .map(mapCelesTrakRecord);

    if (satellites.length === 0) {
      return {
        status: "fallback",
        satellites: [],
        updatedAt: null,
        message: "CelesTrak returned no usable station records. No orbital tracks are shown.",
      };
    }

    return {
      status: "ready",
      satellites,
      updatedAt: records[0]?.EPOCH ?? null,
      message: `${satellites.length} real station objects loaded from CelesTrak GP data.`,
    };
  }, [failed, records]);
}

function mapCelesTrakRecord(record: CelesTrakRecord, index: number): VisualSatellite {
  const meanMotion = record.MEAN_MOTION ?? 15;
  const meanMotionRadSec = (meanMotion * Math.PI * 2) / 86400;
  const semiMajorAxisKm = Math.cbrt(EARTH_MU_KM3_S2 / meanMotionRadSec ** 2);
  const altitudeKm = Math.max(160, semiMajorAxisKm - EARTH_RADIUS_KM);
  const visualAltitude = 2.08 + Math.min(altitudeKm, 1400) / 1250;

  return {
    name: record.OBJECT_NAME ?? `SAT ${record.NORAD_CAT_ID}`,
    catalogId: String(record.NORAD_CAT_ID ?? "unknown"),
    altitude: visualAltitude,
    inclination: degreesToRadians(record.INCLINATION ?? 0),
    raan: degreesToRadians(record.RA_OF_ASC_NODE ?? 0),
    phase: index * 1.36,
    speed: 0.12 + Math.min(meanMotion, 16) / 50,
    color: index === 0 ? "#f5c768" : "#8be9ff",
    epoch: record.EPOCH ?? null,
  };
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

export { CELESTRAK_STATIONS_URL };
