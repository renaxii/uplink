import { NextResponse } from "next/server";

const CELESTRAK_STATIONS_URL =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=STATIONS&FORMAT=JSON";

export async function GET() {
  try {
    const response = await fetch(CELESTRAK_STATIONS_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return NextResponse.json({
        records: [],
        error: `CelesTrak request failed with ${response.status}`,
      });
    }

    return NextResponse.json({
      records: await response.json(),
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      records: [],
      error: error instanceof Error ? error.message : "CelesTrak request failed",
    });
  }
}
