"use client";
import { useEffect, useState } from "react";


export default function KeywordList({ genreId, limit = 30 }: { genreId: string; limit?: number }) {
  const [rows, setRows] = useState<{ token: string; count: number }[]>([]);


  async function load() {
    const res = await fetch(`/api/trends/keywords?genreId=${encodeURIComponent(genreId)}&limit=${limit}`);
    const json = await res.json();
    setRows(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, [genreId, limit]);

  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent<{ genreId?: string }>).detail;
      if (!detail?.genreId || detail.genreId === genreId) {
        load();
      }
    };
    window.addEventListener("rakuten-data-updated", handler as EventListener);
    return () => window.removeEventListener("rakuten-data-updated", handler as EventListener);
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
