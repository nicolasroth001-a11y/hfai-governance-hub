import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft } from "lucide-react";

export default function AdminRuleDetail() {
  return (
    <div className="space-y-section">
      <div className="space-y-base">
        <Link to="/admin/rules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Rules
        </Link>
        <SectionHeader title="Rule Detail" description="Not available" />
      </div>
      <p className="text-sm text-card-foreground/50">No rules route exists in the backend yet.</p>
    </div>
  );
}
