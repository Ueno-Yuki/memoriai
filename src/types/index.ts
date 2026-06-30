// -----------------------------------------------
// Trip
// -----------------------------------------------

export type Trip = {
  id: string; // UUID v4。URLトークンとして使用
  title: string;
  startDate: string; // ISO 8601 date (YYYY-MM-DD)
  endDate: string;
  destinationLabel?: string;
  notes?: string;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string;
};

// -----------------------------------------------
// MediaItem — 元ファイルではなく抽出済みメタデータ
// -----------------------------------------------

export type MediaKind = "photo" | "video";

export type MediaItem = {
  id: string;
  tripId: string;
  kind: MediaKind;
  capturedAt?: string; // ISO 8601 datetime (EXIFから抽出)
  latitude?: number;
  longitude?: number;
  placeLabel?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  userCaption?: string;
  createdAt: string;
};

// -----------------------------------------------
// PlaceVisit
// -----------------------------------------------

export type PlaceSource = "gps" | "user" | "ai";

export type PlaceVisit = {
  id: string;
  tripId: string;
  label: string;
  latitude?: number;
  longitude?: number;
  startedAt?: string;
  endedAt?: string;
  source: PlaceSource;
  evidenceMediaIds: string[];
};

// -----------------------------------------------
// TimelineEntry
// -----------------------------------------------

export type TimelineSource = "system" | "user" | "ai";

export type TimelineEntry = {
  id: string;
  tripId: string;
  occurredAt?: string;
  title: string;
  body?: string;
  placeVisitId?: string;
  mediaItemIds: string[];
  source: TimelineSource;
};

// -----------------------------------------------
// Story — 元写真・サムネイルは含まない
// -----------------------------------------------

export type StoryStatus = "draft" | "confirmed";

export type EvidenceType = "media" | "place" | "time" | "user_note" | "inferred";

export type AiEvidence = {
  id: string;
  tripId: string;
  storySectionId?: string;
  type: EvidenceType;
  label: string;
  sourceRef?: string; // MediaItem ID や PlaceVisit ID など
  confidence?: number; // 0〜1
  explanation: string;
};

export type StorySection = {
  id: string;
  heading: string;
  text: string;
  relatedTimelineEntryIds: string[];
  evidenceIds: string[];
};

export type Story = {
  id: string;
  tripId: string;
  title: string;
  summary?: string;
  sections: StorySection[];
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
};

// -----------------------------------------------
// TripSession — セッション内の旅行データ全体
// -----------------------------------------------

export type TripSession = {
  trip: Trip;
  mediaItems: MediaItem[];
  placeVisits: PlaceVisit[];
  timelineEntries: TimelineEntry[];
  story: Story | null;
  evidence: AiEvidence[];
};
