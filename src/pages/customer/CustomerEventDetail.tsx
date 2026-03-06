import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchAIEvent, fetchReviews } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { DataTable, DataTableColumn } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, MessageSquare, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const reviewColumns: DataTableColumn<any>[] = [
  { key: "decision", header: "Decision", render: (r) => <Badge variant={r.decision === "approved" ? "default" : "destructive"} className="capitalize text-xs">{r.decision}</Badge> },
  { key: "reviewer_name", header: "Reviewer", render: (r) => <span className="text-sm">{r.reviewer_name || "—"}</span> },
  { key: "comments", header: "Notes", render: (r) => <span className="text-sm text-card-foreground/60">{r.comments || "—"}</span> },
  { key: "created_at", header: "Time", render: (r) => <span className="text-xs text-card-foreground/50">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
];

export default function CustomerEventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchAIEvent(id).catch(() => null),
      fetchReviews().catch(() => []),
    ]).then(([evt, allReviews]) => {
      setEvent(evt);
      // Filter reviews linked to violations from this event
      setReviews(allReviews);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (!event) return <p className="text-sm text-destructive py-10 text-center">Event not found.</p>;

  const metadata = event.metadata || (typeof event.payload === "object" ? event.payload : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customer/events" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <SectionHeader title="Event Detail" description={`Event ${event.id.slice(0, 8)}`} />
        <Badge variant="outline" className="ml-auto capitalize">{event.event_type}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={MessageSquare} title="Input">
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.input_text || (typeof event.payload === "string" ? event.payload : "No input recorded")}
          </p>
        </ContentCard>
        <ContentCard icon={FileText} title="Output">
          <p className="text-sm text-card-foreground whitespace-pre-wrap">
            {event.output_text || "No output recorded"}
          </p>
        </ContentCard>
      </div>

      {metadata && (
        <ContentCard icon={Code} title="Metadata">
          <pre className="text-xs text-card-foreground/70 font-mono bg-secondary/30 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </ContentCard>
      )}

      <ContentCard title="Linked Reviews">
        <DataTable columns={reviewColumns} data={reviews} rowKey={(r) => r.id} emptyMessage="No reviews linked to this event" />
      </ContentCard>
    </div>
  );
}
