"use client";
import { useEffect, useState } from "react";
import BarChart, { BarDatum } from "@/app/_components/charts/BarChart";


export default function PriceHistogram({ genreId }: { genreId: string }) {
  const [data, setData] = useState<BarDatum[]>([]);


  useEffect(() => {
    (async () => {
      const url = `/api/trends/price-bins?genreId=${encodeURIComponent(genreId)}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data);
    })();
  }, [genreId]);


  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">価格帯ヒストグラム（最新バッチ）</h3>
      <BarChart data={data} />
    </div>
  );
}