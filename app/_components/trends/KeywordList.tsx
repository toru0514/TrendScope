"use client";
import { useEffect, useState } from "react";


export default function KeywordList({ genreId, limit = 30 }: { genreId: string; limit?: number }) {
  const [rows, setRows] = useState<{ token: string; count: number }[]>([]);


  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/trends/keywords?genreId=${encodeURIComponent(genreId)}&limit=${limit}`);
      const json = await res.json();
      setRows(json.data ?? []);
    })();
  }, [genreId, limit]);


  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">タイトル頻出ワード（簡易）</h3>
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <span key={r.token} className="text-xs rounded-md px-2 py-1 bg-muted" title={`${r.count}`}>
{r.token}
</span>
        ))}
      </div>
    </div>
  );
}