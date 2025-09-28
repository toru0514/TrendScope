"use client";
import { useEffect, useState } from "react";


type ShopRow = {
  shop_name: string;
  items: number;
  avg_price: number;
  min_price: number | null;
  max_price: number | null;
};

export default function TopShopsTable({ genreId, limit = 10 }: { genreId: string; limit?: number }) {
  const [rows, setRows] = useState<ShopRow[]>([]);


  async function load() {
    const res = await fetch(`/api/trends/top-shops?genreId=${encodeURIComponent(genreId)}&limit=${limit}`);
    const json = await res.json();
    const rows: ShopRow[] = Array.isArray(json.data)
      ? json.data.map((r: any) => ({
          shop_name: r.shop_name,
          items: Number(r.items ?? 0),
          avg_price: Number(r.avg_price ?? 0),
          min_price: r.min_price != null ? Number(r.min_price) : null,
          max_price: r.max_price != null ? Number(r.max_price) : null,
        }))
      : [];
    setRows(rows);
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
      <h3 className="text-sm font-medium">ショップ別 上位</h3>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left">ショップ名</th>
            <th className="px-3 py-2 text-right">件数</th>
            <th className="px-3 py-2 text-right">平均価格</th>
            <th className="px-3 py-2 text-right">最安</th>
            <th className="px-3 py-2 text-right">最高</th>
          </tr>
          </thead>
          <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{r.shop_name}</td>
              <td className="px-3 py-2 text-right">{r.items}</td>
              <td className="px-3 py-2 text-right">¥{Math.round(r.avg_price).toLocaleString()}</td>
              <td className="px-3 py-2 text-right">{r.min_price != null ? `¥${Math.round(r.min_price).toLocaleString()}` : "—"}</td>
              <td className="px-3 py-2 text-right">{r.max_price != null ? `¥${Math.round(r.max_price).toLocaleString()}` : "—"}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
