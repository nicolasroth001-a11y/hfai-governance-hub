import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle, AlertTriangle, Download, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Jurisdiction {
  id: string;
  name: string;
  flag: string;
  regulation: string;
  status: "active" | "upcoming" | "draft";
  effectiveDate: string;
  articles: string[];
  coveragePercent: number;
}

const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "eu",
    name: "European Union",
    flag: "🇪🇺",
    regulation: "EU AI Act (Regulation 2024/1689)",
    status: "active",
    effectiveDate: "August 2026 (GPAI)",
    articles: ["Art. 9 — Risk Management", "Art. 12 — Record Keeping", "Art. 14 — Human Oversight", "Art. 15 — Accuracy & Robustness"],
    coveragePercent: 85,
  },
  {
    id: "us-co",
    name: "Colorado, US",
    flag: "🇺🇸",
    regulation: "Colorado AI Act (SB 24-205)",
    status: "active",
    effectiveDate: "February 2026",
    articles: ["§ 6-1-1702 — Risk Assessment", "§ 6-1-1703 — Deployer Duties", "§ 6-1-1704 — Consumer Rights"],
    coveragePercent: 70,
  },
  {
    id: "us-nist",
    name: "United States (Federal)",
    flag: "🇺🇸",
    regulation: "NIST AI RMF 1.0",
    status: "active",
    effectiveDate: "January 2023",
    articles: ["GOVERN — Governance structures", "MAP — Risk mapping", "MEASURE — Risk measurement", "MANAGE — Risk management"],
    coveragePercent: 80,
  },
  {
    id: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    regulation: "UK AI Regulation (Pro-Innovation Framework)",
    status: "upcoming",
    effectiveDate: "Expected 2026-2027",
    articles: ["Safety — System safety requirements", "Transparency — Explainability", "Fairness — Bias prevention", "Accountability — Governance"],
    coveragePercent: 60,
  },
  {
    id: "ca",
    name: "Canada",
    flag: "🇨🇦",
    regulation: "AIDA (Artificial Intelligence and Data Act)",
    status: "draft",
    effectiveDate: "TBD (Bill C-27)",
    articles: ["§ 5 — Responsible AI", "§ 7 — Risk Assessment", "§ 8 — Mitigation Measures", "§ 11 — Record Keeping"],
    coveragePercent: 45,
  },
];

export default function CustomerMultiJurisdiction() {
  const { profile } = useAuth();
  const [systems, setSystems] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase.from("ai_systems").select("id, name").eq("org_id", profile.org_id).then(({ data }) => setSystems(data ?? []));
  }, [profile?.org_id]);

  const handleExport = (jurisdictionId: string) => {
    toast({ title: "Export started", description: `Generating ${jurisdictionId.toUpperCase()} compliance report…` });
  };

  const statusColor = (s: string) => s === "active" ? "default" : s === "upcoming" ? "secondary" : "outline";

  return (
    <SubscriptionGate feature="Multi-Jurisdiction">
      <SectionHeader title="Multi‑Jurisdiction Engine" description="One governance layer, multiple regulatory outputs. Map your AI governance to regulations worldwide." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{JURISDICTIONS.length}</p>
            <p className="text-xs text-muted-foreground">Jurisdictions</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{JURISDICTIONS.filter(j => j.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active Regulations</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{systems.length}</p>
            <p className="text-xs text-muted-foreground">AI Systems Covered</p>
          </CardContent>
        </Card>
        <Card className="rounded-[16px]">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{JURISDICTIONS.filter(j => j.status !== "active").length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        {JURISDICTIONS.map((j) => (
          <Card key={j.id} className="rounded-[16px]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{j.flag}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{j.name}</h3>
                      <Badge variant={statusColor(j.status)} className="text-xs capitalize">{j.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{j.regulation}</p>
                    <p className="text-xs text-muted-foreground mt-1">Effective: {j.effectiveDate}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport(j.id)}>
                  <Download className="h-4 w-4 mr-1" /> Export Report
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">HFAI Coverage</span>
                  <span className="text-xs font-medium">{j.coveragePercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${j.coveragePercent}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {j.articles.map((art) => (
                  <div key={art} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{art}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SubscriptionGate>
  );
}
