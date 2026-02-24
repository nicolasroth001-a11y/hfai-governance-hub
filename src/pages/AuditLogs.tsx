import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAuditLogs } from "@/lib/mock-data";
import { format } from "date-fns";

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const actions = [...new Set(mockAuditLogs.map((l) => l.action))];
  const entityTypes = [...new Set(mockAuditLogs.map((l) => l.entity_type))];

  const filtered = mockAuditLogs.filter((log) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (entityFilter !== "all" && log.entity_type !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete activity log</p>
      </div>

      <div className="flex gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entityTypes.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-card-foreground/10">
              <TableHead className="text-card-foreground/60">Timestamp</TableHead>
              <TableHead className="text-card-foreground/60">Action</TableHead>
              <TableHead className="text-card-foreground/60">Actor</TableHead>
              <TableHead className="text-card-foreground/60">Entity</TableHead>
              <TableHead className="text-card-foreground/60">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id} className="border-card-foreground/10">
                <TableCell className="text-card-foreground/70 text-sm font-mono text-xs">
                  {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                </TableCell>
                <TableCell className="text-card-foreground text-sm capitalize">
                  {log.action.replace(/_/g, " ")}
                </TableCell>
                <TableCell className="text-card-foreground/70 text-sm">{log.actor}</TableCell>
                <TableCell className="text-card-foreground/70 text-sm">
                  {log.entity_type} / {log.entity_id}
                </TableCell>
                <TableCell className="text-card-foreground/60 text-sm max-w-xs truncate">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
