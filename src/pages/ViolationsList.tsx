import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { mockViolations } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export default function ViolationsList() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockViolations.filter((v) => {
    if (severityFilter !== "all" && v.severity !== severityFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Violations</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and review AI governance violations</p>
      </div>

      <div className="flex gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-secondary border-border text-secondary-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-card-foreground/10">
              <TableHead className="text-card-foreground/60">ID</TableHead>
              <TableHead className="text-card-foreground/60">Description</TableHead>
              <TableHead className="text-card-foreground/60">Severity</TableHead>
              <TableHead className="text-card-foreground/60">Rule</TableHead>
              <TableHead className="text-card-foreground/60">Detected</TableHead>
              <TableHead className="text-card-foreground/60">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id} className="border-card-foreground/10 hover:bg-card-foreground/5 transition-colors">
                <TableCell>
                  <Link to={`/violations/${v.id}`} className="font-medium text-primary hover:underline">
                    {v.id}
                  </Link>
                </TableCell>
                <TableCell className="text-card-foreground text-sm max-w-xs truncate">{v.description}</TableCell>
                <TableCell><SeverityBadge severity={v.severity} /></TableCell>
                <TableCell className="text-card-foreground/70 text-sm">{v.rule_id}</TableCell>
                <TableCell className="text-card-foreground/70 text-sm">
                  {formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}
                </TableCell>
                <TableCell><StatusBadge status={v.status} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-card-foreground/50 py-12">
                  No violations match filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
