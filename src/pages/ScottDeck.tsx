import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Stethoscope,
  Brain,
  MessageSquare,
  FileSearch,
  Lock,
  Activity,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * /scott — Interactive deck for Scott @ Community Medical Centers
 * Mirrors the DM exactly: ambient scribes, CDS, patient chatbots →
 * HIPAA-mapped, hash-chained audit trail before it touches a chart.
 * One-query OCR / plaintiff response, not a 6-month forensic project.
 */

const ACCENT = "#c4993a"; // HFAI gold

// ---------- Slide shells ----------

function SlideFrame({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="relative w-full h-full bg-[#0a0a0b] text-white overflow-hidden flex flex-col">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Gold corner accent */}
      <div
        className="absolute top-0 left-0 h-1 w-32"
        style={{ background: ACCENT }}
      />
      <div className="relative flex-1 flex flex-col px-12 md:px-20 py-10 md:py-14">
        {eyebrow && (
          <div
            className="text-[11px] tracking-[0.25em] uppercase mb-4 font-medium"
            style={{ color: ACCENT }}
          >
            {eyebrow}
          </div>
        )}
        {children}
      </div>
      <div className="relative px-12 md:px-20 pb-5 flex justify-between items-center text-[11px] text-white/40 tracking-wider">
        <span>HFAI · prepared for Scott · Community Medical Centers</span>
        <span>hfa-i.org</span>
      </div>
    </div>
  );
}

// ---------- Slides ----------

function Slide1Cover() {
  return (
    <SlideFrame eyebrow="A note for Scott">
      <div className="flex-1 flex flex-col justify-center max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8" style={{ color: ACCENT }} />
          <span className="text-sm tracking-widest text-white/70">HFAI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
          Every AI decision that touched the patient.
          <br />
          <span style={{ color: ACCENT }}>One query. Not six months.</span>
        </h1>
        <p className="mt-8 text-xl text-white/70 max-w-2xl leading-relaxed">
          Hash-chained, HIPAA-mapped audit trails for ambient scribes, clinical
          decision support, and patient chatbots — before anything touches a
          chart.
        </p>
        <div className="mt-12 text-sm text-white/40">
          For Community Medical Centers · drafted by Nicolas Roth
        </div>
      </div>
    </SlideFrame>
  );
}

function Slide2Reframe() {
  return (
    <SlideFrame eyebrow="What sharpened">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        This isn't student governance.
        <br />
        <span className="text-white/60">
          It's the audit trail OCR and plaintiffs will demand.
        </span>
      </h2>
      <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl">
        <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02]">
          <div className="text-xs uppercase tracking-widest text-white/40 mb-3">
            The wrong story
          </div>
          <p className="text-lg text-white/50 line-through decoration-white/30">
            Classroom AI policy, faculty review boards, student data ethics.
          </p>
        </div>
        <div
          className="border rounded-lg p-6"
          style={{
            borderColor: `${ACCENT}55`,
            background: `${ACCENT}0d`,
          }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: ACCENT }}
          >
            The CMC story
          </div>
          <p className="text-lg text-white">
            Every ambient transcript, every CDS recommendation, every patient
            chatbot response — logged, mapped to HIPAA, hash-chained, and
            queryable in one shot.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

function Slide3UseCases() {
  const cases = [
    {
      icon: Stethoscope,
      title: "Ambient clinical scribes",
      examples: "Nuance DAX · Abridge · Suki",
      body: "Every transcript and SOAP-note suggestion captured with a HIPAA-mapped audit trail before it ever touches the chart.",
    },
    {
      icon: Brain,
      title: "Clinical decision support",
      examples: "Sepsis alerts · imaging triage · risk scoring",
      body: "Every CDS recommendation reviewable, every override captured, every drift event escalated to your medical staff committee.",
    },
    {
      icon: MessageSquare,
      title: "Patient-facing chatbots",
      examples: "Triage · scheduling · symptom checkers",
      body: "PHI exposure, off-label medical advice, and emergency-handoff failures blocked at the API in milliseconds.",
    },
  ];
  return (
    <SlideFrame eyebrow="Where it fits at CMC">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        Three workflows. One governance layer.
      </h2>
      <div className="mt-10 grid md:grid-cols-3 gap-6 flex-1">
        {cases.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="border border-white/10 rounded-xl p-6 bg-white/[0.02] flex flex-col"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                style={{ background: `${ACCENT}1f` }}
              >
                <Icon className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <div className="text-xl font-semibold mb-1">{c.title}</div>
              <div className="text-xs text-white/40 mb-4 tracking-wide">
                {c.examples}
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{c.body}</p>
            </motion.div>
          );
        })}
      </div>
    </SlideFrame>
  );
}

function Slide4HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "PHI-safe ingestion",
      body: "Prompts and responses captured at the proxy. Raw PHI never persisted in clear text — only hash-chained metadata.",
    },
    {
      n: "02",
      title: "Dual mapping",
      body: "Every event tagged to HIPAA Security Rule + EU AI Act articles in the same write. No second tool, no reconciliation.",
    },
    {
      n: "03",
      title: "Human oversight layer",
      body: "Reviewers your medical staff committee will sign off on — overrides, notes, decisions, all SHA-256 chained.",
    },
    {
      n: "04",
      title: "One-query evidence",
      body: "When OCR or a plaintiff's attorney asks, you return every AI decision that touched the patient. Same day, not six months.",
    },
  ];
  return (
    <SlideFrame eyebrow="How it works">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        Built for the moment someone asks for the receipts.
      </h2>
      <div className="mt-10 grid md:grid-cols-2 gap-5 flex-1 content-start">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.45 }}
            className="border border-white/10 rounded-xl p-6 bg-white/[0.02] flex gap-5"
          >
            <div
              className="text-3xl font-light tabular-nums"
              style={{ color: ACCENT }}
            >
              {s.n}
            </div>
            <div>
              <div className="text-lg font-semibold mb-1">{s.title}</div>
              <p className="text-sm text-white/65 leading-relaxed">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SlideFrame>
  );
}

function Slide5OneQuery() {
  return (
    <SlideFrame eyebrow="The moment that matters">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        "Show me every AI decision that touched this patient."
      </h2>
      <p className="mt-5 text-lg text-white/60 max-w-3xl">
        Without HFAI, this is a six-month forensic project across vendor logs,
        EHR audit trails, and screenshots. With HFAI, it's a single query
        against a hash-chained ledger.
      </p>

      <div className="mt-10 grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-6 flex-1">
        <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-4 text-white/40 text-xs uppercase tracking-widest">
            <FileSearch className="w-4 h-4" /> Without HFAI
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li>• Email three vendors. Wait.</li>
            <li>• Reconcile EHR access logs by hand.</li>
            <li>• No proof the AI output wasn't altered.</li>
            <li>• Plaintiff's expert dictates the timeline.</li>
            <li className="text-white/50 italic pt-2">
              Median: 4–6 months. Outcome: settlement pressure.
            </li>
          </ul>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-8 h-8" style={{ color: ACCENT }} />
        </div>

        <div
          className="rounded-xl p-6 border"
          style={{
            borderColor: `${ACCENT}55`,
            background: `${ACCENT}0d`,
          }}
        >
          <div
            className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest"
            style={{ color: ACCENT }}
          >
            <Lock className="w-4 h-4" /> With HFAI
          </div>
          <ul className="space-y-3 text-sm text-white">
            <li>• One query, scoped by patient ID.</li>
            <li>• Cryptographic chain proves nothing was altered.</li>
            <li>• Each event already mapped to HIPAA + EU AI Act.</li>
            <li>• Reviewer notes and overrides included.</li>
            <li className="pt-2 italic" style={{ color: ACCENT }}>
              Median: same business day. Outcome: you set the narrative.
            </li>
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}

function Slide6Demo() {
  return (
    <SlideFrame eyebrow="The walkthrough I promised">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        Seven minutes. No form wall.
      </h2>
      <p className="mt-5 text-lg text-white/65 max-w-3xl">
        The demo walks through PHI-safe ingestion, EU AI Act + HIPAA dual
        mapping, and the human-oversight layer your medical staff committee
        will want to sign off on.
      </p>

      <div className="mt-10 flex-1 grid md:grid-cols-3 gap-4">
        {[
          { label: "Scene 4", title: "Live event flow", note: "PHI-safe ingestion" },
          {
            label: "Scene 5",
            title: "Violation blocked",
            note: "Before the chart sees it",
            highlight: true,
          },
          {
            label: "Scene 8",
            title: "Hash-chained review",
            note: "Reviewer + cryptographic proof",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border rounded-xl p-6 bg-white/[0.02] flex flex-col"
            style={{
              borderColor: s.highlight ? `${ACCENT}80` : "rgba(255,255,255,0.1)",
              background: s.highlight ? `${ACCENT}10` : undefined,
            }}
          >
            <div
              className="text-[11px] uppercase tracking-widest mb-3"
              style={{ color: s.highlight ? ACCENT : "rgba(255,255,255,0.4)" }}
            >
              {s.label}
            </div>
            <div className="text-xl font-semibold mb-1">{s.title}</div>
            <div className="text-sm text-white/55">{s.note}</div>
            {s.highlight && (
              <div
                className="mt-auto pt-4 text-xs italic"
                style={{ color: ACCENT }}
              >
                Start here if short on time.
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
        <Activity className="w-4 h-4" style={{ color: ACCENT }} />
        Live demo: <span className="text-white">hfa-i.org</span>
      </div>
    </SlideFrame>
  );
}

function Slide7Pilot() {
  const items = [
    "30-day Free Pilot, full Sovereign-tier features, no card required",
    "One CMC AI workflow of your choice — scribe, CDS, or patient chatbot",
    "Day-30 readout with whoever owns AI governance (CISO, CMIO, CCO — or all three)",
    "If it earns its place, we move to paid. If it doesn't, you walk away with a working governance baseline.",
  ];
  return (
    <SlideFrame eyebrow="The starting point">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-tight">
        A 30-day pilot, scoped to one workflow.
      </h2>
      <div className="mt-10 grid md:grid-cols-[1.2fr_1fr] gap-10 flex-1">
        <ul className="space-y-4">
          {items.map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex gap-4 items-start"
            >
              <CheckCircle2
                className="w-5 h-5 mt-1 flex-shrink-0"
                style={{ color: ACCENT }}
              />
              <span className="text-lg text-white/85 leading-relaxed">{t}</span>
            </motion.li>
          ))}
        </ul>

        <div
          className="rounded-xl p-6 border self-start"
          style={{
            borderColor: `${ACCENT}55`,
            background: `${ACCENT}0d`,
          }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: ACCENT }}
          >
            Self-provision
          </div>
          <div className="text-2xl font-semibold mb-2">hfa-i.org/signup</div>
          <p className="text-sm text-white/65 leading-relaxed">
            Email + password + organization name. Tenant-isolated database
            slice, default HIPAA + EU AI Act rule pack, and a fresh
            hash-chained audit trail provisioned in under a second.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

function Slide8Close() {
  return (
    <SlideFrame eyebrow="Two questions">
      <div className="flex-1 flex flex-col justify-center max-w-4xl">
        <div className="space-y-10">
          <div>
            <div
              className="text-sm tracking-widest uppercase mb-3"
              style={{ color: ACCENT }}
            >
              One
            </div>
            <p className="text-3xl md:text-4xl font-light leading-snug">
              Which clinical AI workflow at CMC is{" "}
              <span className="font-semibold">closest</span> to a
              regulator-visible incident today?
            </p>
          </div>
          <div>
            <div
              className="text-sm tracking-widest uppercase mb-3"
              style={{ color: ACCENT }}
            >
              Two
            </div>
            <p className="text-3xl md:text-4xl font-light leading-snug">
              Who owns the audit-trail conversation when{" "}
              <span className="font-semibold">OCR or your malpractice carrier</span>{" "}
              calls?
            </p>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 text-sm text-white/50">
          Nicolas Roth · nicolasroth@hfa-i.org · hfa-i.org
        </div>
      </div>
    </SlideFrame>
  );
}

const SLIDES = [
  { id: 1, title: "Cover", Component: Slide1Cover },
  { id: 2, title: "What sharpened", Component: Slide2Reframe },
  { id: 3, title: "Three workflows", Component: Slide3UseCases },
  { id: 4, title: "How it works", Component: Slide4HowItWorks },
  { id: 5, title: "One query", Component: Slide5OneQuery },
  { id: 6, title: "Demo", Component: Slide6Demo },
  { id: 7, title: "Pilot", Component: Slide7Pilot },
  { id: 8, title: "Two questions", Component: Slide8Close },
];

// ---------- Page shell ----------

export default function ScottDeck() {
  const [index, setIndex] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const next = useCallback(
    () => setIndex((i) => Math.min(SLIDES.length - 1, i + 1)),
    []
  );
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") setIndex(0);
      else if (e.key === "End") setIndex(SLIDES.length - 1);
      else if (e.key === "f" || e.key === "F") toggleFs();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const Current = SLIDES[index].Component;

  // SEO
  useEffect(() => {
    document.title = "HFAI for Community Medical Centers · Scott";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Hash-chained, HIPAA-mapped audit trails for ambient scribes, clinical decision support, and patient chatbots."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="text-white/70">HFAI · Scott · CMC deck</span>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFs}
            className="text-white/70 hover:text-white"
          >
            {isFs ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stage — 16:9 */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div
          ref={stageRef}
          className="relative w-full max-w-[1400px] aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Current />
            </motion.div>
          </AnimatePresence>

          {/* Nav controls */}
          <button
            onClick={prev}
            disabled={index === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            disabled={index === SLIDES.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thumb strip */}
      <div className="border-t border-white/10 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 justify-center min-w-fit">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`px-3 py-2 rounded-md text-xs whitespace-nowrap transition border ${
                i === index
                  ? "text-white"
                  : "text-white/50 hover:text-white/80 border-transparent"
              }`}
              style={{
                borderColor: i === index ? `${ACCENT}80` : "transparent",
                background: i === index ? `${ACCENT}1a` : "transparent",
              }}
            >
              <span className="tabular-nums mr-2 text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-white/30 pb-3">
        ← → to navigate · F for fullscreen
      </div>
    </div>
  );
}
