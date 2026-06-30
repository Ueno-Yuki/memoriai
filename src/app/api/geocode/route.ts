import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocode";

type RequestBody = {
  latitude?: unknown;
  longitude?: unknown;
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_input", "リクエストの形式が正しくありません", 400);
  }

  const { latitude, longitude } = body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return errorResponse("invalid_input", "latitude と longitude は数値で指定してください", 400);
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return errorResponse("invalid_input", "緯度・経度の値が範囲外です", 400);
  }

  try {
    const place = await reverseGeocode(latitude, longitude);
    return NextResponse.json({ place });
  } catch (err) {
    const code = (err as Error & { code?: string }).code ?? "geocode_failed";
    if (code === "rate_limited") {
      return errorResponse("rate_limited", "しばらく時間をおいてから再度お試しください", 429);
    }
    console.error("[geocode] reverseGeocode failed:", err);
    return errorResponse("geocode_failed", "場所名の取得に失敗しました", 502);
  }
}
