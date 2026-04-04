import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast({ title: t("customerCertificates.certificateGenerated"), description: t("customerCertificates.certificateGeneratedDesc") });
    } catch {
      toast({ title: t("customerCertificates.generateError"), description: t("customerCertificates.generateErrorDesc"), variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <SubscriptionGate feature="Compliance Certificates">
      <SectionHeader title={t("customerCertificates.title")} description={t("customerCertificates.description")} />

      <div className="grid gap-4 mt-6">
        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">{t("customerCertificates.loading")}</CardContent></Card>
        ) : systems.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">{t("customerCertificates.noSystems")}</CardContent></Card>
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
                {generating === sys.id ? t("customerCertificates.generating") : t("customerCertificates.generateCertificate")}
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
            <CardTitle className="text-sm">{t("customerCertificates.cryptoSigned")}</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>{t("customerCertificates.cryptoSignedDesc")}</CardDescription></CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm">{t("customerCertificates.articleCoverage")}</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>{t("customerCertificates.articleCoverageDesc")}</CardDescription></CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm">{t("customerCertificates.regulatorReady")}</CardTitle>
          </CardHeader>
          <CardContent><CardDescription>{t("customerCertificates.regulatorReadyDesc")}</CardDescription></CardContent>
        </Card>
      </div>
    </SubscriptionGate>
  );
}
