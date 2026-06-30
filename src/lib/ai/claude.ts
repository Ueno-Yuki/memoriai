import Anthropic from "@anthropic-ai/sdk";
import { buildStoryPrompt } from "./prompt";

const MODEL = "claude-sonnet-4-6";

let _client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export type EvidenceInput = {
  type: "media" | "place" | "time" | "user_note" | "inferred";
  sourceRef: string | null;
  label: string;
  explanation: string;
  confidence: number;
};

export type SectionOutput = {
  heading: string;
  text: string;
  evidence: EvidenceInput[];
};

export type StoryOutput = {
  title: string;
  summary: string;
  sections: SectionOutput[];
};

export type MediaItemInput = {
  id: string;
  kind: string;
  capturedAt?: string;
  placeLabel?: string;
  userCaption?: string;
};

export type PlaceVisitInput = {
  id: string;
  label: string;
  startedAt?: string;
  endedAt?: string;
};

export type TripInput = {
  title: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

export type GenerateOptions = {
  tone?: "warm" | "formal" | "casual";
  length?: "short" | "medium" | "long";
};

function extractJson(text: string): string {
  // Claude がコードブロックで囲んで返すケースに対応
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // コードブロックなしの場合はそのまま
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return text.slice(jsonStart, jsonEnd + 1);
  }
  return text.trim();
}

export async function generateStory(
  trip: TripInput,
  mediaItems: MediaItemInput[],
  placeVisits: PlaceVisitInput[],
  options: GenerateOptions = {}
): Promise<StoryOutput> {
  const client = getClient();
  const prompt = buildStoryPrompt(trip, mediaItems, placeVisits, options);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonText = extractJson(rawText);

  let parsed: StoryOutput;
  try {
    parsed = JSON.parse(jsonText) as StoryOutput;
  } catch {
    throw Object.assign(new Error("Claude response is not valid JSON"), {
      code: "ai_failed",
    });
  }

  if (!parsed.title || !Array.isArray(parsed.sections)) {
    throw Object.assign(
      new Error("Claude response missing required fields"),
      { code: "ai_failed" }
    );
  }

  // Explainable AI 要件：各セクションに evidence が必要
  const missesEvidence = parsed.sections.some(
    (s) => !Array.isArray(s.evidence) || s.evidence.length === 0
  );
  if (missesEvidence) {
    throw Object.assign(
      new Error("Claude response missing evidence in sections"),
      { code: "ai_failed" }
    );
  }

  // confidence が数値でない場合はデフォルト値に正規化
  for (const section of parsed.sections) {
    for (const ev of section.evidence) {
      if (typeof ev.confidence !== "number") ev.confidence = 0.5;
    }
  }

  return parsed;
}
