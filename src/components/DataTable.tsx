import { ReactNode, useState } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  loading?: boolean;
  pageSize?: number;
}

export function DataTable<T>({ columns, data, rowKey, emptyMessage = "No results found", loading = false, pageSize = 15 }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);
  const showPagination = data.length > pageSize;

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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="border-card-foreground/6">
                {columns.map((col) => (
                  <TableCell key={col.key} className="py-3.5">
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <>
              {paged.map((row) => (
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
            </>
          )}
        </TableBody>
      </Table>
      {showPagination && !loading && (
        <div className="flex items-center justify-between border-t border-card-foreground/6 px-4 py-3">
          <span className="text-xs text-card-foreground/40">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-card-foreground/60 px-2">
              {page + 1} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </ShadcnCard>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
