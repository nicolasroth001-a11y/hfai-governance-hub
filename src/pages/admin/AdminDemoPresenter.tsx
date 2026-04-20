import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, X, Play, Sparkles, UserPlus, KeyRound, Plug,
  Activity, ShieldAlert, UserCheck, BarChart3, Trophy, FileText
} from "lucide-react";
import { loadDemoConfig, SCENARIO_LIBRARY, type DemoConfig, type DemoScenario } from "@/lib/demoConfig";
import { Scene1Signup } from "@/components/demo/Scene1Signup";
import { Scene2ApiKey } from "@/components/demo/Scene2ApiKey";
import { Scene3Connect } from "@/components/demo/Scene3Connect";
import { Scene4EventFlow } from "@/components/demo/Scene4EventFlow";
import { Scene5Violation } from "@/components/demo/Scene5Violation";
import { Scene6Review } from "@/components/demo/Scene6Review";
import { Scene7Dashboard } from "@/components/demo/Scene7Dashboard";
import { Scene8Close } from "@/components/demo/Scene8Close";

const SCENES = [
  { id: 1, key: "signup", icon: UserPlus, title: "Sign-Up", subtitle: "Self-serve, no gating", duration: "2 min" },
  { id: 2, key: "apikey", icon: KeyRound, title: "API Key Issued", subtitle: "Org provisioned in <1s", duration: "1 min" },
  { id: 3, key: "connect", icon: Plug, title: "Connect AI System", subtitle: "One-line proxy swap", duration: "2 min" },
  { id: 4, key: "events", icon: Activity, title: "Live Events Flow", subtitle: "Real-time capture", duration: "1 min" },
  { id: 5, key: "violation", icon: ShieldAlert, title: "Violation Detected", subtitle: "The wow moment", duration: "4 min" },
  { id: 6, key: "review", icon: UserCheck, title: "Human Review", subtitle: "Hash-chained audit trail", duration: "3 min" },
  { id: 7, key: "dashboard", icon: BarChart3, title: "Compliance Dashboard", subtitle: "Annex IV export", duration: "3 min" },
  { id: 8, key: "close", icon: Trophy, title: "Close + Pricing", subtitle: "The two-question close", duration: "3 min" },
];

const SCRIPTS: Record<number, { say: string[]; show: string; ifAsked?: { q: string; a: string }[] }> = {
  1: {
    show: "Animated sign-up form auto-fills the prospect's company name. Org appears in admin in real time.",
    say: [
      "\"This is what your team — or your AESOP students — would do today. No sales gate, no IT ticket.\"",
      "\"Email, password, company name. Done. We just provisioned a real org with isolated data, RLS policies, the works.\"",
    ],
  },
  2: {
    show: "API key auto-generates with hfai_ prefix. Big copy button. Visible to the prospect.",
    say: [
      "\"Notice the key: hfai_… — that's your unique tenant identifier. Every event, every audit log is scoped to this key.\"",
      "\"You'd store this in your env vars like any other secret. We'll never ask for your OpenAI key in clear text.\"",
    ],
  },
  3: {
    show: "Code snippet — change OpenAI base URL to HFAI proxy. That's it. One line.",
    say: [
      "\"This is the entire integration. One line of code. We sit invisibly between your app and OpenAI/Anthropic/Gemini.\"",
      "\"You don't change your prompts. You don't refactor your code. You don't lose vendor flexibility.\"",
    ],
    ifAsked: [
      { q: "Latency?", a: "12ms p99. Detection runs in parallel with the upstream call." },
      { q: "Vendor lock-in?", a: "Pull the proxy URL out, you're back to direct OpenAI. Zero lock-in." },
    ],
  },
  4: {
    show: "Live event feed streams in. New events appear with subtle highlight. Input + output captured.",
    say: [
      "\"Watch the feed. Every prompt, every response — captured in real time.\"",
      "\"Metadata is hash-chained. Raw PHI is never persisted in clear text.\"",
    ],
  },
  5: {
    show: "Pre-scripted prompt fires. Response streams briefly, then BLOCKED in milliseconds. Banner shows the rule.",
    say: [
      "\"Watch this prompt — this is what could end your career as a CISO.\"",
      "\"In a normal stack, that response goes to the user. In HFAI:\"",
      "\"BLOCKED in 12 milliseconds. EU AI Act mapped. HIPAA mapped. Audit log written. All before the user sees anything.\"",
    ],
    ifAsked: [
      { q: "False positives?", a: "Every rule is testable + reviewable. You tune sensitivity per system." },
      { q: "What if I want to allow it?", a: "Override → reason logged → hash-chained. The override itself is auditable." },
    ],
  },
  6: {
    show: "Reviewer opens the violation, types notes, clicks Approve/Reject. Each click writes a SHA-256 hash. Chain visible.",
    say: [
      "\"Reviewer opens it. Types a note. Makes a decision.\"",
      "\"This is the hash — SHA-256 of the previous review's hash + this review's content. Tamper one, every subsequent hash breaks.\"",
      "\"This is what a QSA wants. This is what an OCR auditor wants. Most 'AI governance' tools log to a CSV. We give you cryptographic evidence.\"",
    ],
  },
  7: {
    show: "Compliance gauge updates from 78% → 84%. Annex IV PDF generates and downloads.",
    say: [
      "\"Compliance score updates live based on the review.\"",
      "\"Now watch — one click — Annex IV technical documentation generates as a PDF. This is the doc EU regulators will demand starting August 2026.\"",
      "\"Most companies will scramble to write this in Word. You generate it from real data, on demand.\"",
    ],
  },
  8: {
    show: "Pricing tiers + your two-question close on screen.",
    say: [
      "\"Two questions before I let you go:\"",
      "\"1. Of the healthcare clients you're advising — is there one where this would be most urgent?\"",
      "\"2. Your AESOP curriculum — would your students benefit from a free HFAI tier to run governance against real models?\"",
    ],
  },
};

export default function AdminDemoPresenter() {
  const [config] = useState<DemoConfig>(() => loadDemoConfig());
  const [scene, setScene] = useState(1);
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(config.primaryScenario);
  const [showScript, setShowScript] = useState(true);

  const next = () => setScene((s) => Math.min(8, s + 1));
  const prev = () => setScene((s) => Math.max(1, s - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") window.close();
      else if (e.key === "h") setShowScript((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = SCENES[scene - 1];
  const script = SCRIPTS[scene];

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden flex">
      {/* LEFT — Stepper sidebar */}
      <aside className="w-72 border-r border-border bg-card/50 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight">PRESENTER MODE</p>
              <p className="text-[10px] text-muted-foreground">{config.prospectName} · {config.callDate}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.close()} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-3 border-b border-border">
          <Progress value={(scene / 8) * 100} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1.5">Scene {scene} of 8</p>
        </div>

        <nav className="flex-1 overflow-auto px-2 py-3 space-y-1">
          {SCENES.map((s) => {
            const Icon = s.icon;
            const active = s.id === scene;
            const done = s.id < scene;
            return (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                  active ? "bg-primary/10 ring-1 ring-primary/30" :
                  done ? "opacity-50 hover:opacity-100" : "hover:bg-card"
                }`}
              >
                <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{s.id}. {s.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.subtitle}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/60 mt-1.5">{s.duration}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={prev} disabled={scene === 1} className="flex-1 h-8">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={next} disabled={scene === 8} className="flex-1 h-8">
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground text-center">← → arrows · H to toggle script · ESC to exit</p>
        </div>
      </aside>

      {/* CENTER — Stage */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-card">
        <header className="px-8 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Scene {current.id} of 8</p>
            <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {scene === 5 && (
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
            <Badge variant="outline" className="text-[10px]">{config.prospectCompany}</Badge>
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
              {scene === 1 && <Scene1Signup config={config} />}
              {scene === 2 && <Scene2ApiKey config={config} />}
              {scene === 3 && <Scene3Connect config={config} />}
              {scene === 4 && <Scene4EventFlow config={config} />}
              {scene === 5 && <Scene5Violation config={config} scenario={activeScenario} />}
              {scene === 6 && <Scene6Review config={config} scenario={activeScenario} />}
              {scene === 7 && <Scene7Dashboard config={config} />}
              {scene === 8 && <Scene8Close config={config} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* RIGHT — Script panel */}
      {showScript && (
        <aside className="w-80 border-l border-border bg-card/50 flex flex-col shrink-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wide">Talking Points</p>
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
                  <li key={i} className="text-xs leading-relaxed border-l-2 border-primary/30 pl-3">
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
