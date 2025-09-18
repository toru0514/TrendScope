
'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrendFilter({ defaultSince, defaultIntent }:{ defaultSince:string; defaultIntent:string; }){
  const router = useRouter();
  const sp = useSearchParams();
  const update=(k:string,v:string)=>{ const q=new URLSearchParams(sp.toString()); q.set(k,v); router.push(`/?${q.toString()}`); };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm text-muted-foreground">期間</div>
        <Select defaultValue={defaultSince} onValueChange={(v)=>update('since', v)}>
          <SelectTrigger><SelectValue placeholder="期間を選択"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">直近7日</SelectItem>
            <SelectItem value="30d">直近30日</SelectItem>
            <SelectItem value="90d">直近90日</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="mb-2 text-sm text-muted-foreground">意図</div>
        <Tabs defaultValue={defaultIntent} onValueChange={(v)=>update('intent', v)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="request">要望</TabsTrigger>
            <TabsTrigger value="complaint">不満</TabsTrigger>
            <TabsTrigger value="praise">称賛</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
