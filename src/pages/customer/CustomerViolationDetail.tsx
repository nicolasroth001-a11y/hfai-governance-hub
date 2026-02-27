import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ViolationDetailCard } from "@/components/ViolationDetailCard";
import { SectionHeader } from "@/components/SectionHeader";
import { fetchViolation } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function CustomerViolationDetail() {
  const { id } = useParams();
  const [v, setV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchViolation(id)
        .then(setV)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p className="text-sm text-card-foreground/50 py-10 text-center">Loading…</p>;
  if (error || !v) return (
    <div className="text-center py-20 text-muted-foreground">
      {error || "Violation not found."}{" "}
      <Link to="/customer/violations" className="text-primary hover:underline">Back to violations</Link>
    </div>
  );

  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/customer/violations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Violations
        </Link>
        <SectionHeader title={`Violation ${v.id}`} description="Review violation details" />
      </div>
      <ViolationDetailCard
        id={v.id}
        description={v.description}
        severity={v.severity}
        rule_id={v.rule_id}
        detected_at={v.detected_at}
        status={v.status || "open"}
      />
    </div>
  );
}
