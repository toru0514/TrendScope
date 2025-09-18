
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PostSamples({ rows }:{rows:{post_id:string;intent:string;summary:string}[]}){
  return (
    <Table>
      <TableHeader><TableRow><TableHead>意図</TableHead><TableHead>要約</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map(r=>(<TableRow key={r.post_id}><TableCell><Badge variant="secondary">{r.intent}</Badge></TableCell><TableCell>{r.summary}</TableCell></TableRow>))}
      </TableBody>
    </Table>
  );
}
