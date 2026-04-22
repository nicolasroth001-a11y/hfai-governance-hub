import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, X, Sparkles, UserPlus, KeyRound, Plug,
  Activity, ShieldAlert, UserCheck, BarChart3, Trophy, FileText, Users, MessageSquare, FileCheck, Eye, EyeOff, Factory,
} from "lucide-react";
import { loadDemoConfig, SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";
import { Scene1Signup } from "@/components/demo/Scene1Signup";
import { Scene2ApiKey } from "@/components/demo/Scene2ApiKey";
import { Scene2bReviewers } from "@/components/demo/Scene2bReviewers";
import { Scene3Connect } from "@/components/demo/Scene3Connect";
import { Scene4EventFlow } from "@/components/demo/Scene4EventFlow";
import { Scene5Violation } from "@/components/demo/Scene5Violation";
import { Scene5bUserView } from "@/components/demo/Scene5bUserView";
import { Scene6Review } from "@/components/demo/Scene6Review";
import { Scene7Dashboard } from "@/components/demo/Scene7Dashboard";
import { Scene7bAuditReport } from "@/components/demo/Scene7bAuditReport";
import { Scene7cIndustrialAI } from "@/components/demo/Scene7cIndustrialAI";
import { Scene8Close } from "@/components/demo/Scene8Close";

const SCENES = [
  { id: 1, icon: UserPlus,      title: "Sign-Up",                subtitle: "Self-serve · org provisioned in <1s" },
  { id: 2, icon: KeyRound,      title: "API Key & Setup",        subtitle: "Both sides — your env + our infra" },
  { id: 3, icon: Users,         title: "Reviewer Team",          subtitle: "In-house + optional HFAI Expert" },
  { id: 4, icon: Plug,          title: "Connect AI System",      subtitle: "One-line proxy swap" },
  { id: 5, icon: Activity,      title: "Live Events",            subtitle: "Real-time capture · hash-chained" },
  { id: 6, icon: ShieldAlert,   title: "Violation Detected",     subtitle: "Blocked in milliseconds — admin view" },
  { id: 7, icon: MessageSquare, title: "What the User Sees",     subtitle: "Graceful fallback · zero PHI exposure" },
  { id: 8, icon: UserCheck,     title: "Human Review",           subtitle: "Hash-chained audit trail" },
  { id: 9, icon: BarChart3,     title: "Compliance Dashboard",   subtitle: "Live score · 47 rules active" },
  { id: 10, icon: FileCheck,    title: "Generated Audit Report", subtitle: "Annex IV technical documentation" },
  { id: 11, icon: Factory,      title: "Industrial AI Coverage", subtitle: "Robotics · CV · predictive maintenance" },
  { id: 12, icon: Trophy,       title: "The No-Brainer Close",   subtitle: "Pricing + the two-question close" },
] as const;

const TOTAL = SCENES.length;

const SCRIPTS: Record<number, { say: string[]; show: string; ifAsked?: { q: string; a: string }[] }> = {
  1: {
    show: "Sign-up form auto-fills the prospect's company. Org provisioned in real time.",
    say: [
      "\"This is what your team — or your AESOP students — would do today. No sales gate, no IT ticket.\"",
      "\"Email, password, company name. Done. We just provisioned a real org with isolated data, RLS policies, the works.\"",
    ],
  },
  2: {
    show: "API key with hfai_ prefix. Both customer-side env vars and HFAI-side provisioning shown.",
    say: [
      "\"Notice the key — that's your unique tenant identifier. Every event, every audit log scoped to it.\"",
      "\"Left side: what you put in your env. Right side: what we provision automatically — RLS-isolated tenant, HIPAA + EU AI Act rule pack, audit chain initialized.\"",
    ],
    ifAsked: [
      { q: "Where is data stored?", a: "Lovable Cloud (SOC 2 Type II) — us-east by default, eu-west for EU clients. Sovereign tier offers single-tenant VPC." },
    ],
  },
  3: {
    show: "Reviewer team setup — unlimited in-house reviewers + optional HFAI Expert badge.",
    say: [
      "\"Article 14 of the EU AI Act mandates human oversight. You can add unlimited in-house reviewers — your compliance team, clinical leads, anyone.\"",
      "\"And on Sovereign tier, we appoint an HFAI Expert — independent external oversight with override authority. That's what regulators want to see.\"",
    ],
  },
  4: {
    show: "Code snippet — change OpenAI base URL to HFAI proxy. One line.",
    say: [
      "\"This is the entire integration. One line. We sit invisibly between your app and OpenAI/Anthropic/Gemini.\"",
      "\"You don't change your prompts. You don't refactor your code. You don't lose vendor flexibility.\"",
    ],
    ifAsked: [
      { q: "Latency?", a: "12ms p99. Detection runs in parallel with the upstream call." },
      { q: "Vendor lock-in?", a: "Pull the proxy URL out — you're back to direct OpenAI. Zero lock-in." },
    ],
  },
  5: {
    show: "Live event feed streams in. Each new event appears with a subtle highlight.",
    say: [
      "\"Watch the feed. Every prompt, every response — captured in real time.\"",
      "\"Metadata is hash-chained. Raw PHI is never persisted in clear text.\"",
    ],
  },
  6: {
    show: "Pre-scripted prompt fires. Response BLOCKED in milliseconds. Banner shows the rule + EU/HIPAA mapping.",
    say: [
      "\"Watch this prompt — this is what could end your career as a CISO.\"",
      "\"In a normal stack, that response goes to the user. In HFAI:\"",
      "\"BLOCKED in 12 milliseconds. EU AI Act mapped. HIPAA mapped. Audit log written. All before the user sees anything.\"",
      "\"And here's the part most vendors won't tell you — even if HFAI's cloud went 100% offline, this exact block still fires. Article 5 + COPPA enforcement is embedded in the SDK. We call it Fortress Mode.\"",
    ],
    ifAsked: [
      { q: "False positives?", a: "Every rule is testable + reviewable. You tune sensitivity per system." },
      { q: "What if I want to allow it?", a: "Override → reason logged → hash-chained. The override itself is auditable." },
      { q: "What if your service goes down?", a: "Fortress Mode. The SDK ships with all 8 EU AI Act Article 5 prohibited practices + COPPA red-flags compiled in. Local enforcement is authoritative for the highest-risk categories — an HFAI outage cannot un-block them. Events queue locally and replay when we're back." },
      { q: "So you're saying you can't be the single point of failure?", a: "Correct. For Article 5 + child safety, we are physically incapable of being the SPOF — the rules execute on the customer's machine. For ambiguous content, we fail-closed by default." },
    ],
  },
  7: {
    show: "End-user chat view — graceful fallback message replaces the blocked output. Reference number for follow-up.",
    say: [
      "\"This is what the patient or staff member actually sees. No technical error, no scary 'BLOCKED' banner — a graceful, human handoff message with a reference number.\"",
      "\"Zero PHI exposed. Zero liability. The user feels taken care of, your team gets the audit trail.\"",
    ],
  },
  8: {
    show: "Reviewer opens the violation, types notes, clicks Approve/Reject. Each click writes a SHA-256 hash.",
    say: [
      "\"Reviewer opens it. Types a note. Makes a decision.\"",
      "\"This is the hash — SHA-256 of the previous review's hash + this review's content. Tamper one, every subsequent hash breaks.\"",
      "\"Most 'AI governance' tools log to a CSV. We give you cryptographic evidence.\"",
    ],
  },
  9: {
    show: "Compliance gauge updates from 78% → 84%. Stats panel shows live activity.",
    say: [
      "\"Compliance score updates live based on the review.\"",
      "\"47 active rules. 12,847 events governed in 24 hours. 23 violations blocked. Zero reached end-users.\"",
    ],
  },
  10: {
    show: "Annex IV technical documentation rendered as a paper PDF preview — the actual artifact regulators want.",
    say: [
      "\"One click. This is the Annex IV documentation EU regulators will demand starting August 2026.\"",
      "\"Most companies will scramble to write this in Word from memory. You generate it from real audit data, on demand. 47 pages, regulator-grade.\"",
    ],
  },
  11: {
    show: "Pricing tiers + Fortress Mode badge + the two-question close on screen.",
    say: [
      "\"So that's end-to-end. Sign-up to blocked PHI to regulator-ready evidence — in 15 minutes of real work.\"",
      "\"And remember — Fortress Mode means even an HFAI outage can't expose your students or patients to Article 5 or COPPA-class harm. That promise is in the SDK, not the marketing deck.\"",
      "\"Two questions before I let you go:\"",
      "\"1. Of the healthcare clients you're advising — is there one where this would be most urgent?\"",
      "\"2. Your AESOP curriculum — would your students benefit from a free HFAI tier to run governance against real models?\"",
    ],
    ifAsked: [
      { q: "What's the catch with Fortress Mode?", a: "It only covers the highest-risk categories (Art. 5 + COPPA + self-harm). Org-specific custom rules + AI-based ambiguous classification still need the cloud — but those queue locally and replay on reconnect." },
    ],
  },
};

export default function AdminDemoPresenter() {
  const [config] = useState<DemoConfig>(() => loadDemoConfig());
  const [scene, setScene] = useState(1);
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(config.primaryScenario);
  const [showScript, setShowScript] = useState(true);
  const [cleanMode, setCleanMode] = useState(false); // when true, hide ALL presenter chrome

  const next = () => setScene((s) => Math.min(TOTAL, s + 1));
  const prev = () => setScene((s) => Math.max(1, s - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") {
        if (cleanMode) setCleanMode(false);
        else window.close();
      }
      else if (e.key === "h") setShowScript((v) => !v);
      else if (e.key === "p") setCleanMode((v) => !v); // P for "Present" (clean prospect view)
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanMode]);

  const current = SCENES[scene - 1];
  const script = SCRIPTS[scene];

  const renderScene = () => {
    switch (scene) {
      case 1: return <Scene1Signup config={config} />;
      case 2: return <Scene2ApiKey config={config} />;
      case 3: return <Scene2bReviewers config={config} />;
      case 4: return <Scene3Connect config={config} />;
      case 5: return <Scene4EventFlow config={config} />;
      case 6: return <Scene5Violation config={config} scenario={activeScenario} />;
      case 7: return <Scene5bUserView config={config} scenario={activeScenario} />;
      case 8: return <Scene6Review config={config} scenario={activeScenario} />;
      case 9: return <Scene7Dashboard config={config} />;
      case 10: return <Scene7bAuditReport config={config} />;
      case 11: return <Scene8Close config={config} />;
      default: return null;
    }
  };

  // ============ CLEAN MODE — pure prospect view ============
  if (cleanMode) {
    return (
      <div className="fixed inset-0 text-card-foreground overflow-auto" style={{ background: "hsl(33 25% 88%)" }}>
        <div className="max-w-6xl mx-auto px-8 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene + activeScenario}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {renderScene()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating discreet controls — only presenter notices */}
        <div className="fixed bottom-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={scene === 1} className="h-8 px-2 opacity-40 hover:opacity-100">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={next} disabled={scene === TOTAL} className="h-8 px-2 opacity-40 hover:opacity-100">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCleanMode(false)} className="h-8 gap-1.5 opacity-40 hover:opacity-100">
            <EyeOff className="h-3.5 w-3.5" /> Exit clean
          </Button>
        </div>
      </div>
    );
  }

  // ============ FULL PRESENTER MODE ============
  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden flex">
      {/* LEFT — Stepper sidebar */}
      <aside className="w-72 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight">PRESENTER</p>
              <p className="text-[10px] text-muted-foreground">{config.prospectName} · {config.callDate}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.close()} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-3 border-b border-border">
          <Progress value={(scene / TOTAL) * 100} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1.5">Scene {scene} of {TOTAL}</p>
        </div>

        <nav className="flex-1 overflow-auto px-2 py-3 space-y-0.5">
          {SCENES.map((s) => {
            const Icon = s.icon;
            const active = s.id === scene;
            const done = s.id < scene;
            return (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`w-full text-left flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition ${
                  active ? "bg-primary/10 ring-1 ring-primary/30" :
                  done ? "opacity-50 hover:opacity-100 hover:bg-muted/50" : "hover:bg-muted/50"
                }`}
              >
                <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-card-foreground">{s.id}. {s.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border space-y-2">
          <Button onClick={() => setCleanMode(true)} className="w-full h-8 gap-2 bg-primary hover:bg-primary/90">
            <Eye className="h-3.5 w-3.5" /> Enter Clean Mode
          </Button>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={prev} disabled={scene === 1} className="flex-1 h-8">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={next} disabled={scene === TOTAL} className="flex-1 h-8">
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground text-center leading-tight">
            ← → navigate · P clean mode · H toggle script · ESC exit
          </p>
        </div>
      </aside>

      {/* CENTER — Stage (clean light surface so cards pop) */}
      <main className="flex-1 flex flex-col overflow-hidden text-card-foreground" style={{ background: "hsl(33 25% 88%)" }}>
        <header className="px-8 py-4 border-b border-border bg-background flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Scene {current.id} of {TOTAL}</p>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{current.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {scene === 6 && (
              <div className="flex gap-1.5">
                {Object.entries(SCENARIO_LIBRARY).filter(([k]) => config.scenarios.includes(k as DemoScenario)).map(([k, v]) => (
                  <Button
                    key={k}
                    variant={activeScenario === k ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveScenario(k as DemoScenario)}
                    className="text-xs h-8"
                  >
                    {v.label}
                  </Button>
                ))}
              </div>
            )}
            <Badge variant="outline" className="text-[10px] bg-background">{config.prospectCompany}</Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene + activeScenario}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              {renderScene()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* RIGHT — Script panel */}
      {showScript && script && (
        <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wide text-card-foreground">Talking Points</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowScript(false)} className="h-6 w-6">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-5 space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">On Screen</p>
              <p className="text-xs text-card-foreground/80 italic leading-relaxed">{script.show}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">Say (verbatim or close)</p>
              <ul className="space-y-2.5">
                {script.say.map((line, i) => (
                  <li key={i} className="text-xs leading-relaxed border-l-2 border-primary/40 pl-3 text-card-foreground/90">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {script.ifAsked && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">If asked</p>
                <ul className="space-y-2.5">
                  {script.ifAsked.map((qa, i) => (
                    <li key={i} className="text-xs leading-relaxed">
                      <p className="font-semibold text-card-foreground">Q: {qa.q}</p>
                      <p className="text-card-foreground/70 mt-0.5">A: {qa.a}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      )}

      {!showScript && (
        <Button
          onClick={() => setShowScript(true)}
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 gap-2"
        >
          <FileText className="h-3.5 w-3.5" /> Show script
        </Button>
      )}
    </div>
  );
}
