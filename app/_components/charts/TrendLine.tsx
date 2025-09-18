
'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function TrendLine({ series }:{series:{bucket:string,count:number}[]}){
  const data = { labels: series.map(s=> new Date(s.bucket).toLocaleDateString('ja-JP')), datasets: [{ label:'投稿数', data: series.map(s=>s.count), fill:true }] };
  const options = { responsive:true, maintainAspectRatio:false } as any;
  return <div style={{height:280}}><Line data={data} options={options}/></div>;
}
