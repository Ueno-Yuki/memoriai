"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function TripPage() {
  const { token } = useParams<{ token: string }>();
  const { getTripSession } = useStore();
  const session = getTripSession(token);

  if (!session) {
    return (
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          ← 旅行一覧
        </Link>
        <p className="text-muted-foreground mt-8">
          旅行が見つかりません。セッションが終了したか、URLが無効です。
        </p>
        <Button asChild className="mt-4">
          <Link href="/">旅行一覧へ</Link>
        </Button>
      </main>
    );
  }

  const { trip } = session;

  return (
    <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        ← 旅行一覧
      </Link>
      <h1 className="text-2xl font-semibold mt-4">{trip.title}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {trip.startDate} 〜 {trip.endDate}
        {trip.destinationLabel && ` ・ ${trip.destinationLabel}`}
      </p>
      {trip.notes && (
        <p className="mt-3 text-sm text-foreground/70 whitespace-pre-wrap">{trip.notes}</p>
      )}

      <div className="mt-8 rounded-lg border p-6 text-center text-muted-foreground">
        <p className="text-sm">写真・動画を選択してタイムラインを作成しましょう</p>
        <Button className="mt-4" disabled>
          写真・動画を追加する（準備中）
        </Button>
      </div>
    </main>
  );
}
