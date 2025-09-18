"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrendLine from "./TrendLine"; // TrendLine.tsx にはすでに "use client" が入っているはず

export default function TrendLineSection({ series }: { series: { bucket: string; count: number }[] }) {
  return (
    <Card className="md:col-span-9">
      <CardHeader><CardTitle>トレンド</CardTitle></CardHeader>
      <CardContent>
        <TrendLine series={series}/>
      </CardContent>
    </Card>
  );
}
