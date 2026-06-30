import { extractSingleFileMetadata } from "./extract";
import type { MediaItem } from "@/types";

export type ExtractionSuccess = { status: "ok"; item: MediaItem };
export type ExtractionError = {
  status: "error";
  fileName: string;
  reason: string;
};
export type ExtractionResult = ExtractionSuccess | ExtractionError;

/**
 * 1ファイルからメタデータを抽出して MediaItem を返す。
 * EXIF なし / GPS なしの場合は該当フィールドが undefined になる。
 */
export async function extractMetadata(
  file: File,
  tripId: string
): Promise<MediaItem> {
  return extractSingleFileMetadata(file, tripId);
}

/**
 * 複数ファイルを並列処理し、成功・失敗を ExtractionResult[] で返す。
 * 一部が失敗しても他のファイルの結果は返る。
 */
export async function extractMetadataFromFiles(
  files: File[],
  tripId: string
): Promise<ExtractionResult[]> {
  const settled = await Promise.allSettled(
    files.map((file) => extractSingleFileMetadata(file, tripId))
  );

  return settled.map((result, i) => {
    if (result.status === "fulfilled") {
      return { status: "ok", item: result.value };
    }
    return {
      status: "error",
      fileName: files[i].name,
      reason:
        result.reason instanceof Error
          ? result.reason.message
          : "unknown error",
    };
  });
}
