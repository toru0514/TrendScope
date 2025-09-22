"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export type BarDatum = { label: string; value: number };

type Props = {
  data?: BarDatum[];       // ← optional に
  title?: string;
  height?: number;
};

export default function BarChart({ data, title, height = 220 }: Props) {
  // 受け取り時に常に配列化
  const series = Array.isArray(data) ? data : [];

  // 空のときのUI（任意）
  if (series.length === 0) {
    return (
      <div className="rounded-xl border p-4 h-[220px] grid place-items-center text-sm text-muted-foreground">
        データがまだありません
      </div>
    );
  }

  const chartData = useMemo(() => ({
    labels: series.map(d => d.label),
    datasets: [{
      label: title ?? "値",
      data: series.map(d => d.value),
    }],
  }), [series, title]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }), []);

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}