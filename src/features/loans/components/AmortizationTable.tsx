import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AmortizationRow, formatCurrency, formatDate } from "../utils/calculator";

interface Props {
  rows: AmortizationRow[];
  maxHeight?: string;
}

export function AmortizationTable({ rows, maxHeight = "320px" }: Props) {
  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
        Completa el monto, la tasa y el plazo para ver la tabla.
      </div>
    );
  }

  return (
    <div
      className="border border-border rounded-md overflow-auto"
      style={{ maxHeight }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-[50px]">N°</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead className="text-right">Cuota</TableHead>
            <TableHead className="text-right">Capital</TableHead>
            <TableHead className="text-right">Interés</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.number}>
              <TableCell className="font-medium">{row.number}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(row.due_date)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(row.amount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(row.principal)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(row.interest)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
