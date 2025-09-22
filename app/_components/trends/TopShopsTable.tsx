"use client";
import { useEffect, useState } from "react";


export default function TopShopsTable({ genreId, limit = 10 }: { genreId: string; limit?: number }) {
  const [rows, setRows] = useState<{ shop_name: string; items: number; avg_price: number }[]>([]);


  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/trends/top-shops?genreId=${encodeURIComponent(genreId)}&limit=${limit}`);
      const json = await res.json();
      setRows(json.data ?? []);
    })();
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
          </tr>
          </thead>
          <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{r.shop_name}</td>
              <td className="px-3 py-2 text-right">{r.items}</td>
              <td className="px-3 py-2 text-right">¥{Math.round(r.avg_price).toLocaleString()}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}