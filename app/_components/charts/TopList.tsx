// app/_components/charts/TopList.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TopList({ items }:{ items:{key:string; count:number}[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>キー</TableHead>
          <TableHead className="text-right">件数</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((it, i) => (
          <TableRow key={`${it.key}-${i}`}>
            <TableCell>{it.key}</TableCell>
            <TableCell className="text-right">{it.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
