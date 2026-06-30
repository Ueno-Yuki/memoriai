import type { MediaItemInput, PlaceVisitInput, TripInput, GenerateOptions } from "./claude";

const TONE_LABELS: Record<string, string> = {
  warm: "温かみのある家族向け",
  formal: "丁寧・フォーマル",
  casual: "カジュアル・口語",
};

const LENGTH_LABELS: Record<string, string> = {
  short: "短め（セクションあたり1〜2文）",
  medium: "標準（セクションあたり2〜4文）",
  long: "長め（セクションあたり3〜6文）",
};

export function buildStoryPrompt(
  trip: TripInput,
  mediaItems: MediaItemInput[],
  placeVisits: PlaceVisitInput[],
  options: GenerateOptions = {}
): string {
  const tone = TONE_LABELS[options.tone ?? "warm"] ?? TONE_LABELS["warm"];
  const length = LENGTH_LABELS[options.length ?? "medium"] ?? LENGTH_LABELS["medium"];

  const placeList =
    placeVisits.length > 0
      ? placeVisits
          .map(
            (p) =>
              `- ${p.label}（ID: ${p.id}${p.startedAt ? `、開始: ${p.startedAt}` : ""}${p.endedAt ? `、終了: ${p.endedAt}` : ""}）`
          )
          .join("\n")
      : "（訪問地点データなし）";

  const mediaList =
    mediaItems.length > 0
      ? mediaItems
          .map(
            (m) =>
              `- ID: ${m.id}、種別: ${m.kind === "photo" ? "写真" : "動画"}${m.capturedAt ? `、撮影日時: ${m.capturedAt}` : ""}${m.placeLabel ? `、場所: ${m.placeLabel}` : ""}${m.userCaption ? `、メモ: ${m.userCaption}` : ""}`
          )
          .join("\n")
      : "（メディアデータなし）";

  return `あなたは家族の旅行記を書くアシスタントです。以下の旅行データに基づいて旅行記を生成してください。

## 旅行情報
- タイトル: ${trip.title}
- 期間: ${trip.startDate} 〜 ${trip.endDate}
- メモ: ${trip.notes ?? "なし"}

## 訪問地点
${placeList}

## メディア（写真・動画のメタデータのみ）
${mediaList}

## 文体・分量
- 文体: ${tone}
- 分量: ${length}

## 出力形式

JSONのみを出力してください。コードブロック・余分なテキスト・説明文は含めないでください。

{
  "title": "旅行記タイトル",
  "summary": "1〜2文の旅行要約",
  "sections": [
    {
      "heading": "セクション見出し",
      "text": "セクション本文",
      "evidence": [
        {
          "type": "place|media|time|user_note|inferred",
          "sourceRef": "関連するplace_idまたはmedia_idまたはnull",
          "label": "根拠の短い説明（ユーザーに見せる日本語）",
          "explanation": "この情報をなぜ使ったかの説明（日本語）",
          "confidence": 0.0
        }
      ]
    }
  ]
}

## 制約
- セクションは訪問地点または日付ごとに作成（1〜5セクション）
- 根拠（evidence）は各セクションに1件以上必ず含める
- 根拠が弱い場合は confidence を低く設定（0.3〜0.5）
- 推測の場合は explanation に「推測」と明記する
- 家族関係・写真に写っている人物名の推測はしない
- 場所・日時が不足している場合は曖昧な表現を使う
- 事実の捏造は厳禁`;
}
