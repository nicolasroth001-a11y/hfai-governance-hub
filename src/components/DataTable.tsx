import { ReactNode } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, rowKey, emptyMessage = "No results found" }: DataTableProps<T>) {
  return (
    <ShadcnCard className="overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-card-foreground/6 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className="text-caption font-medium text-card-foreground/40 tracking-wide uppercase h-11">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={rowKey(row)} className="border-card-foreground/6 hover:bg-card-foreground/[0.02] transition-colors">
              {columns.map((col) => (
                <TableCell key={col.key} className={cn("py-3.5", col.className)}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-card-foreground/40 py-16 text-body">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ShadcnCard>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
