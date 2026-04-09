import { ReactNode, useState } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Hide this column on mobile and use card layout instead */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  emptyContent?: ReactNode;
  loading?: boolean;
  pageSize?: number;
  /** Render a card for each row on mobile. If not provided, falls back to a compact table. */
  mobileCard?: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, data, rowKey, emptyMessage = "No results found", emptyContent, loading = false, pageSize = 15, mobileCard }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);
  const showPagination = data.length > pageSize;

  // Mobile card layout
  if (isMobile && mobileCard && !loading && data.length > 0) {
    return (
      <div className="space-y-3">
        {paged.map((row) => (
          <ShadcnCard key={rowKey(row)} className="p-3 animate-fade-in">
            {mobileCard(row)}
          </ShadcnCard>
        ))}
        {showPagination && (
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} total={data.length} />
        )}
      </div>
    );
  }

  // Loading skeleton on mobile
  if (isMobile && mobileCard && loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ShadcnCard key={i} className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </ShadcnCard>
        ))}
      </div>
    );
  }

  return (
    <ShadcnCard className="overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-card-foreground/6 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("text-caption font-medium text-card-foreground/40 tracking-wide uppercase h-11", col.hideOnMobile && "hidden sm:table-cell")}>
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
                    <TableCell key={col.key} className={cn("py-3.5", col.hideOnMobile && "hidden sm:table-cell")}>
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
                      <TableCell key={col.key} className={cn("py-3.5", col.className, col.hideOnMobile && "hidden sm:table-cell")}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-16">
                      {emptyContent ? (
                        <div className="flex flex-col items-center gap-3">{emptyContent}</div>
                      ) : (
                        <span className="text-card-foreground/40 text-body">{emptyMessage}</span>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && !loading && (
        <PaginationBar page={page} setPage={setPage} totalPages={totalPages} pageSize={pageSize} total={data.length} />
      )}
    </ShadcnCard>
  );
}

function PaginationBar({ page, setPage, totalPages, pageSize, total }: { page: number; setPage: (p: number) => void; totalPages: number; pageSize: number; total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-card-foreground/6 px-4 py-3">
      <span className="text-xs text-card-foreground/40">
        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
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
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
