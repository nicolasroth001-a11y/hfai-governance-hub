import { SectionHeader } from "@/components/SectionHeader";
import { DemoDisabled } from "@/components/DemoDisabled";
import { ContentCard } from "@/components/ContentCard";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCreateReviewer() {
  return (
    <div className="space-y-section">
      <SectionHeader title="Create Reviewer" description="Add a new human reviewer to the system" />
      <DemoDisabled>
        <ContentCard icon={UserPlus} title="New Reviewer" className="max-w-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reviewer Name</Label>
              <Input disabled placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input disabled placeholder="reviewer@hfai.com" />
            </div>
            <Button disabled className="w-full">Create Reviewer</Button>
          </div>
        </ContentCard>
      </DemoDisabled>
    </div>
  );
}
