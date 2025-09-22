"use client";
import { useEffect, useState } from "react";


export default function ReviewStatsCard({ genreId }: { genreId: string }) {
  const [stats, setStats] = useState<{ avg_rating: number; med_rating: number; avg_review_count: number } | null>(null);


  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/trends/review-stats?genreId=${encodeURIComponent(genreId)}`);
      const json = await res.json();
      setStats(json.data ?? null);
    })();
  }, [genreId]);


  return (
    <div className="rounded-xl border p-4 grid grid-cols-3 gap-3 text-center">
      <div>
        <div className="text-xs text-muted-foreground">平均★</div>
        <div className="text-lg font-semibold">{stats?.avg_rating?.toFixed?.(2) ?? "-"}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">中央値★</div>
        <div className="text-lg font-semibold">{stats?.med_rating?.toFixed?.(2) ?? "-"}</div>
      </div>
      <div>
        <div className="text-xs text-muted-foreground">平均レビュー数</div>
        <div className="text-lg font-semibold">{stats?.avg_review_count?.toFixed?.(0) ?? "-"}</div>
      </div>
    </div>
  );
}