import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateStory } from "@/lib/ai";

type MediaItemInput = {
  id?: unknown;
  kind?: unknown;
  capturedAt?: unknown;
  placeLabel?: unknown;
  userCaption?: unknown;
};

type PlaceVisitInput = {
  id?: unknown;
  label?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
};

type RequestBody = {
  trip?: {
    title?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    notes?: unknown;
  };
  mediaItems?: unknown;
  placeVisits?: unknown;
  options?: {
    tone?: unknown;
    length?: unknown;
  };
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function validateMediaItem(m: MediaItemInput): m is {
  id: string;
  kind: string;
  capturedAt?: string;
  placeLabel?: string;
  userCaption?: string;
} {
  return typeof m.id === "string" && typeof m.kind === "string";
}

function validatePlaceVisit(p: PlaceVisitInput): p is {
  id: string;
  label: string;
  startedAt?: string;
  endedAt?: string;
} {
  return typeof p.id === "string" && typeof p.label === "string";
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_input", "リクエストの形式が正しくありません", 400);
  }

  const { trip, mediaItems, placeVisits, options } = body;

  if (
    !trip ||
    typeof trip.title !== "string" ||
    typeof trip.startDate !== "string" ||
    typeof trip.endDate !== "string"
  ) {
    return errorResponse(
      "invalid_input",
      "trip.title / trip.startDate / trip.endDate は必須です",
      400
    );
  }

  const rawMedia = Array.isArray(mediaItems)
    ? (mediaItems as MediaItemInput[])
    : [];
  const rawPlaces = Array.isArray(placeVisits)
    ? (placeVisits as PlaceVisitInput[])
    : [];

  const validMedia = rawMedia.filter(validateMediaItem);
  const validPlaces = rawPlaces.filter(validatePlaceVisit);

  const tone = ["warm", "formal", "casual"].includes(options?.tone as string)
    ? (options!.tone as "warm" | "formal" | "casual")
    : undefined;
  const length = ["short", "medium", "long"].includes(
    options?.length as string
  )
    ? (options!.length as "short" | "medium" | "long")
    : undefined;

  try {
    const result = await generateStory(
      {
        title: trip.title as string,
        startDate: trip.startDate as string,
        endDate: trip.endDate as string,
        notes: typeof trip.notes === "string" ? trip.notes : undefined,
      },
      validMedia,
      validPlaces,
      { tone, length }
    );

    // sections に ID を付与し、evidence を inline で返す（api-interface.md 準拠）
    const sections = result.sections.map((s) => ({
      id: `section_${randomUUID()}`,
      heading: s.heading,
      text: s.text,
      evidence: s.evidence.map((e) => ({
        type: e.type,
        sourceRef: e.sourceRef ?? null,
        label: e.label,
        explanation: e.explanation,
        confidence: e.confidence,
      })),
    }));

    return NextResponse.json({
      story: {
        title: result.title,
        summary: result.summary ?? "",
        sections,
      },
    });
  } catch (err) {
    console.error("[story/generate] failed:", err);
    return errorResponse("ai_failed", "旅行記の生成に失敗しました。しばらくしてから再度お試しください", 502);
  }
}
