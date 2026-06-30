"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip } = useStore();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setError("タイトル・開始日・終了日は必須です");
      return;
    }
    if (startDate > endDate) {
      setError("終了日は開始日以降にしてください");
      return;
    }
    const trip = createTrip({
      title: title.trim(),
      startDate,
      endDate,
      destinationLabel: destinationLabel.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    router.push(`/trips/${trip.id}`);
  }

  return (
    <main className="flex-1 p-6 max-w-lg mx-auto w-full">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        ← 旅行一覧
      </Link>
      <h1 className="text-xl font-semibold mt-4 mb-6">新しい旅行を作成</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="title">
            旅行タイトル <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：京都・大阪 春の旅"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="startDate">
              開始日 <span className="text-destructive">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="endDate">
              終了日 <span className="text-destructive">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="destinationLabel">
            代表的な行き先
          </label>
          <input
            id="destinationLabel"
            type="text"
            value={destinationLabel}
            onChange={(e) => setDestinationLabel(e.target.value)}
            placeholder="例：京都府"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="notes">
            メモ
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="この旅行について自由に記入してください"
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-background resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full">
          旅行を作成する
        </Button>
      </form>
    </main>
  );
}
