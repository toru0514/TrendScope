"use client";
import { useEffect, useState } from "react";
import BarChart, { BarDatum } from "@/app/_components/charts/BarChart";


export default function PriceHistogram({ genreId }: { genreId: string }) {
  const [data, setData] = useState<BarDatum[]>([]);


  async function load() {
    const url = `/api/trends/price-bins?genreId=${encodeURIComponent(genreId)}`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, [genreId]);

  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent<{ genreId?: string }>).detail;
      if (!detail?.genreId || detail.genreId === genreId) {
        load();
      }
    };
    window.addEventListener("rakuten-data-updated", handler as EventListener);
    return () => window.removeEventListener("rakuten-data-updated", handler as EventListener);
  }, [genreId]);


  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">価格帯ヒストグラム（最新バッチ）</h3>
      <BarChart data={data} />
    </div>
  );
}
