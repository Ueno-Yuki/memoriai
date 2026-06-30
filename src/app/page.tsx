"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { sessions } = useStore();

  return (
    <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">旅行一覧</h1>
        <Button asChild>
          <Link href="/trips/new">新しい旅行</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">まだ旅行がありません</p>
          <Button asChild variant="outline">
            <Link href="/trips/new">最初の旅行を作成する</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map(({ trip }) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="block rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <p className="font-medium">{trip.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {trip.startDate} 〜 {trip.endDate}
                  {trip.destinationLabel && ` ・ ${trip.destinationLabel}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
