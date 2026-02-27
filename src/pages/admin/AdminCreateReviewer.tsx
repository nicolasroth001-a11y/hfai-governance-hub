import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { UserPlus } from "lucide-react";

export default function AdminCreateReviewer() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Create Reviewer" description="Add a new human reviewer to the system" />
      <ContentCard icon={UserPlus} title="Not Available" className="max-w-lg">
        <p className="text-sm text-card-foreground/70">
          Reviewer creation is not yet supported by the backend. The <code>/admin/create-reviewer</code> route does not exist.
        </p>
      </ContentCard>
    </div>
  );
}
