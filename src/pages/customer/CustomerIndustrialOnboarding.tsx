import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Cpu, Eye, Wrench, Truck, Copy, ArrowRight, Factory, Plug, Activity } from "lucide-react";
import { toast } from "sonner";

type AIType = "robotics" | "vision_qc" | "predictive_maintenance" | "agv";

interface IndustrialAIConfig {
  id: AIType;
  label: string;
  icon: typeof Cpu;
  description: string;
  standards: string[];
  rulePack: { name: string; description: string }[];
  payload: Record<string, unknown>;
  curl: string;
}

const CONFIGS: Record<AIType, IndustrialAIConfig> = {
  robotics: {
    id: "robotics",
    label: "Industrial Robotics",
    icon: Cpu,
    description:
      "Collaborative arms, weld cells, pick-and-place. Govern force, torque, and proximity decisions before the robot acts.",
    standards: ["ISO 10218", "ISO/TS 15066", "ISO 13849-1", "OSHA 1910.212"],
    rulePack: [
      { name: "Force ceiling exceeded", description: "Block any motion command where commanded force > collaborative limit." },
      { name: "Proximity violation", description: "Block motion when human detected inside safety-rated stop zone." },
      { name: "Speed override", description: "Flag any speed command bypassing the collaborative speed limit." },
    ],
    payload: {
      ai_system_id: "<your_robot_system_id>",
      event_type: "robot_motion_decision",
      payload: {
        cell_id: "WELD-CELL-04",
        commanded_force_n: 142,
        force_limit_n: 150,
        commanded_speed_mm_s: 250,
        speed_limit_mm_s: 250,
        proximity_human_m: 1.8,
        operator_present: true,
        model_confidence: 0.94,
      },
    },
    curl: `curl -X POST https://your-app.hfa-i.org/api/ingest \\
  -H "Authorization: Bearer $HFAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "robot_motion_decision",
    "payload": {
      "cell_id": "WELD-CELL-04",
      "commanded_force_n": 142,
      "force_limit_n": 150,
      "proximity_human_m": 1.8,
      "model_confidence": 0.94
    }
  }'`,
  },
  vision_qc: {
    id: "vision_qc",
    label: "Computer Vision QC",
    icon: Eye,
    description:
      "Defect detection, weld inspection, label verification. Govern the pass/fail decision before product ships or is rejected.",
    standards: ["ISO 9001", "IATF 16949", "ISO 23482", "FDA 21 CFR Part 820"],
    rulePack: [
      { name: "Low-confidence pass", description: "Escalate any PASS where model confidence < 0.85." },
      { name: "Defect class drift", description: "Alert when defect distribution shifts > 20% week-over-week." },
      { name: "Repeat false-negative", description: "Block model from auto-passing SKU after 2 confirmed escapes." },
    ],
    payload: {
      ai_system_id: "<your_vision_system_id>",
      event_type: "qc_decision",
      payload: {
        line_id: "LINE-A2",
        sku: "PCB-9821",
        decision: "PASS",
        defect_classes: ["solder_bridge"],
        model_confidence: 0.78,
        image_hash: "sha256:abc123...",
        operator_overridden: false,
      },
    },
    curl: `curl -X POST https://your-app.hfa-i.org/api/ingest \\
  -H "Authorization: Bearer $HFAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "qc_decision",
    "payload": {
      "line_id": "LINE-A2",
      "sku": "PCB-9821",
      "decision": "PASS",
      "model_confidence": 0.78
    }
  }'`,
  },
  predictive_maintenance: {
    id: "predictive_maintenance",
    label: "Predictive Maintenance",
    icon: Wrench,
    description:
      "Vibration, temperature, current-signature models recommending repair, replace, or run-to-failure decisions.",
    standards: ["IEC 61508", "ISO 13374", "ISO 17359", "NIST AI RMF"],
    rulePack: [
      { name: "RUL drift", description: "Alert when remaining-useful-life prediction shifts > 30% in 24h." },
      { name: "Run-to-failure on critical asset", description: "Block any RTF recommendation on Tier-1 assets without human approval." },
      { name: "Sensor anomaly", description: "Flag predictions made on input data outside training distribution." },
    ],
    payload: {
      ai_system_id: "<your_pdm_system_id>",
      event_type: "maintenance_recommendation",
      payload: {
        asset_id: "PUMP-117",
        asset_tier: 1,
        recommendation: "run_to_failure",
        predicted_rul_hours: 240,
        prior_rul_hours: 720,
        vibration_rms_mm_s: 7.2,
        temperature_c: 78,
        model_confidence: 0.81,
      },
    },
    curl: `curl -X POST https://your-app.hfa-i.org/api/ingest \\
  -H "Authorization: Bearer $HFAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "maintenance_recommendation",
    "payload": {
      "asset_id": "PUMP-117",
      "asset_tier": 1,
      "recommendation": "run_to_failure",
      "predicted_rul_hours": 240
    }
  }'`,
  },
  agv: {
    id: "agv",
    label: "AGV / Autonomous Mobile",
    icon: Truck,
    description:
      "Autonomous guided vehicles, mobile robots, warehouse fleet. Govern path, speed, and obstacle decisions in shared human spaces.",
    standards: ["ANSI/RIA R15.08", "ISO 3691-4", "OSHA 1910.178", "ISO 13849-1"],
    rulePack: [
      { name: "Proximity to pedestrian", description: "Block any path that brings AGV within 0.5m of a detected human." },
      { name: "Speed in mixed-traffic zone", description: "Flag any speed > 1.5 m/s while operating in human-shared aisle." },
      { name: "Path deviation", description: "Alert when planned path deviates from approved corridor map." },
    ],
    payload: {
      ai_system_id: "<your_agv_system_id>",
      event_type: "navigation_decision",
      payload: {
        unit_id: "AGV-22",
        zone: "AISLE-7-MIXED",
        planned_speed_m_s: 1.8,
        zone_speed_limit_m_s: 1.5,
        nearest_human_m: 2.1,
        path_deviation_m: 0.3,
        model_confidence: 0.91,
      },
    },
    curl: `curl -X POST https://your-app.hfa-i.org/api/ingest \\
  -H "Authorization: Bearer $HFAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "navigation_decision",
    "payload": {
      "unit_id": "AGV-22",
      "zone": "AISLE-7-MIXED",
      "planned_speed_m_s": 1.8,
      "nearest_human_m": 2.1
    }
  }'`,
  },
};

export default function CustomerIndustrialOnboarding() {
  const [aiType, setAiType] = useState<AIType>("robotics");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const config = useMemo(() => CONFIGS[aiType], [aiType]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const StepBadge = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
    <div className={`flex items-center gap-2 ${active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
        active ? "border-primary bg-primary/10" : done ? "border-muted-foreground bg-muted" : "border-border"
      }`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Factory className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Industrial AI Onboarding</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up governance for AI making decisions on your factory floor — robotics, vision QC, predictive maintenance, AGVs.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-2">
            <StepBadge n={1} label="Choose AI type" active={step === 1} done={step > 1} />
            <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            <StepBadge n={2} label="Sample payload" active={step === 2} done={step > 2} />
            <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            <StepBadge n={3} label="Rule pack" active={step === 3} done={step > 3} />
            <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
            <StepBadge n={4} label="Send first event" active={step === 4} done={false} />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: AI type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — What type of industrial AI are you governing?</CardTitle>
            <CardDescription>Pick the closest match. You can add more systems later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(CONFIGS).map((c) => {
                const Icon = c.icon;
                const selected = aiType === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setAiType(c.id)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{c.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: View sample payload <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payload */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2 — Sample event payload for {config.label}</CardTitle>
                <CardDescription>This is the JSON shape your control system will POST to HFAI for every AI decision.</CardDescription>
              </div>
              <Badge variant="outline">{config.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="json">
              <TabsList>
                <TabsTrigger value="json">JSON payload</TabsTrigger>
                <TabsTrigger value="curl">cURL example</TabsTrigger>
              </TabsList>
              <TabsContent value="json">
                <div className="relative">
                  <pre className="bg-muted/50 border rounded-md p-4 text-xs overflow-x-auto font-mono">
{JSON.stringify(config.payload, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copy(JSON.stringify(config.payload, null, 2), "Payload")}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="curl">
                <div className="relative">
                  <pre className="bg-muted/50 border rounded-md p-4 text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{config.curl}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copy(config.curl, "cURL command")}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>
                Next: Choose rule pack <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Rule pack */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Recommended rule pack for {config.label}</CardTitle>
            <CardDescription>
              These rules ship pre-mapped to the standards regulators and insurers ask about.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Mapped standards
              </div>
              <div className="flex flex-wrap gap-2">
                {config.standards.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {config.rulePack.map((r) => (
                <div key={r.name} className="border rounded-md p-3 bg-card">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3 italic">
              HFAI governs the AI <strong>decision</strong>. Your control system always owns the physical action — that's
              the legally defensible boundary the EU AI Act expects.
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>
                Next: Send first event <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Send first event */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 — Send your first industrial event</CardTitle>
            <CardDescription>
              Wire one decision from your control system into HFAI. Once we see it, your audit trail is live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link to="/customer/connect" className="block">
                <div className="border rounded-md p-4 hover:bg-accent/30 transition-colors h-full">
                  <Plug className="h-4 w-4 text-primary mb-2" />
                  <div className="font-semibold text-sm">Get your API key</div>
                  <div className="text-xs text-muted-foreground mt-1">From the Connect page.</div>
                </div>
              </Link>
              <Link to="/customer/ai-systems" className="block">
                <div className="border rounded-md p-4 hover:bg-accent/30 transition-colors h-full">
                  <Cpu className="h-4 w-4 text-primary mb-2" />
                  <div className="font-semibold text-sm">Register AI system</div>
                  <div className="text-xs text-muted-foreground mt-1">Create your robot, line, or fleet entry.</div>
                </div>
              </Link>
              <Link to="/customer/events" className="block">
                <div className="border rounded-md p-4 hover:bg-accent/30 transition-colors h-full">
                  <Activity className="h-4 w-4 text-primary mb-2" />
                  <div className="font-semibold text-sm">Watch live events</div>
                  <div className="text-xs text-muted-foreground mt-1">See decisions stream in real time.</div>
                </div>
              </Link>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => { setStep(1); toast.success("Walkthrough complete"); }}>
                Restart walkthrough
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
