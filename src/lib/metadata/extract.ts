import type { MediaItem, MediaKind } from "@/types";

function generateId(): string {
  return crypto.randomUUID();
}

function getMediaKind(file: File): MediaKind {
  return file.type.startsWith("video/") ? "video" : "photo";
}

type VideoMetadata = {
  durationSeconds?: number;
  width?: number;
  height?: number;
};

async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        durationSeconds:
          isFinite(video.duration) && video.duration > 0
            ? video.duration
            : undefined,
        width: video.videoWidth > 0 ? video.videoWidth : undefined,
        height: video.videoHeight > 0 ? video.videoHeight : undefined,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };

    video.src = url;
  });
}

async function extractImageDimensions(
  file: File
): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth > 0 ? img.naturalWidth : undefined,
        height: img.naturalHeight > 0 ? img.naturalHeight : undefined,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };

    img.src = url;
  });
}

export async function extractSingleFileMetadata(
  file: File,
  tripId: string
): Promise<MediaItem> {
  const kind = getMediaKind(file);
  const now = new Date().toISOString();

  let capturedAt: string | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;
  let width: number | undefined;
  let height: number | undefined;
  let durationSeconds: number | undefined;

  if (kind === "photo") {
    try {
      const exifr = await import("exifr");
      const exif = await exifr.parse(file, { gps: true });

      if (exif) {
        const date =
          exif.DateTimeOriginal ?? exif.CreateDate ?? exif.ModifyDate;
        if (date instanceof Date && !isNaN(date.getTime())) {
          capturedAt = date.toISOString();
        }

        if (
          typeof exif.latitude === "number" &&
          typeof exif.longitude === "number"
        ) {
          // 小数点6桁（約0.1m精度）に丸める
          latitude = Math.round(exif.latitude * 1e6) / 1e6;
          longitude = Math.round(exif.longitude * 1e6) / 1e6;
        }

        const exifWidth = exif.ImageWidth ?? exif.ExifImageWidth;
        const exifHeight = exif.ImageHeight ?? exif.ExifImageHeight;
        if (typeof exifWidth === "number") width = exifWidth;
        if (typeof exifHeight === "number") height = exifHeight;
      }
    } catch {
      // EXIF なし / パースエラー → 各フィールドは undefined のまま
    }

    // EXIF から幅・高さが取れなかった場合は img 要素で補完
    if (width === undefined || height === undefined) {
      const dims = await extractImageDimensions(file);
      width = width ?? dims.width;
      height = height ?? dims.height;
    }
  } else {
    const videoMeta = await extractVideoMetadata(file);
    durationSeconds = videoMeta.durationSeconds;
    width = videoMeta.width;
    height = videoMeta.height;
  }

  return {
    id: generateId(),
    tripId,
    kind,
    capturedAt,
    latitude,
    longitude,
    durationSeconds,
    width,
    height,
    createdAt: now,
  };
}
