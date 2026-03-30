import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Shield, Clock, CheckCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AISystem {
  id: string;
  name: string;
  risk_level: string;
  eu_risk_tier: string;
  status: string;
}

export default function CustomerCertificates() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("ai_systems").select("id, name, risk_level, eu_risk_tier, status")
      .eq("org_id", profile.org_id)
      .then(({ data }) => { setSystems(data ?? []); setLoading(false); });
  }, [profile?.org_id]);

  const handleGenerate = async (systemId: string) => {
    setGenerating(systemId);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-report", {
        body: { org_id: profile?.org_id, system_id: systemId, format: "certificate" },
      });
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hfai-compliance-certificate-${systemId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificate generated", description: "Your compliance attestation has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Could not generate certificate.", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <SubscriptionGate feature="Compliance Certificates">
      <SectionHeader title="Compliance Certificates" description="Generate verifiable EU AI Act compliance attestations for each AI system." />

      <div className="grid gap-4 mt-6">
        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading AI systems…</CardContent></Card>
        ) : systems.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No AI systems registered. Add one to generate certificates.</CardContent></Card>
        ) : systems.map((sys) => (
          <Card key={sys.id} className="rounded-[16px]">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{sys.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{sys.eu_risk_tier || "Not classified"}</Badge>
                    <Badge variant={sys.status === "active" ? "default" : "secondary"} className="text-xs">{sys.status}</Badge>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => handleGenerate(sys.id)} disabled={generating === sys.id}>
                {generating === sys.id ? <Clock className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                {generating === sys.id ? "Generating…" : "Generate Certificate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="rounded-[16px]">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm">Cryptographically Signed</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>Each certificate includes a verifiable signature and timestamp for regulatory submission.</CardDescription></CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm">Article-Level Coverage</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>Maps your governance posture to specific EU AI Act articles (9, 12, 14, 15).</CardDescription></CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm">Regulator-Ready</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>Formatted for submission to EU notified bodies and national competent authorities.</CardDescription></CardContent>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
