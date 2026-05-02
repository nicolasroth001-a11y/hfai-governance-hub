import { useState, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, AlertTriangle, UserCheck, ChevronRight,
  Cpu, Zap, Eye, CheckCircle, Scale, Clock, ArrowRight, Calendar, BarChart3,
  Bot, Wrench, Camera, Car,
} from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RiskTicker } from "@/components/landing/RiskTicker";
import { AIScannerWidget } from "@/components/scan/AIScannerWidget";
import { AwsMarketplaceBadge } from "@/components/landing/AwsMarketplaceBadge";
import dashboardPreview from "@/assets/dashboard-preview.png";
import industrialHero from "@/assets/industrial-ai-hero.jpg";

// Lazy-load below-the-fold sections to keep initial JS small
// (prevents white screen / freeze on mobile Safari refresh)
const SocialProof = lazy(() => import("@/components/landing/SocialProof").then(m => ({ default: m.SocialProof })));
const CredibilitySignals = lazy(() => import("@/components/landing/CredibilitySignals").then(m => ({ default: m.CredibilitySignals })));
const CountdownTimer = lazy(() => import("@/components/landing/CountdownTimer").then(m => ({ default: m.CountdownTimer })));
const ExposureCheck = lazy(() => import("@/components/landing/ExposureCheck").then(m => ({ default: m.ExposureCheck })));
const PublicScanStats = lazy(() => import("@/components/landing/PublicScanStats").then(m => ({ default: m.PublicScanStats })));
const TimeToValue = lazy(() => import("@/components/landing/TimeToValue").then(m => ({ default: m.TimeToValue })));
const ROICalculator = lazy(() => import("@/components/landing/ROICalculator").then(m => ({ default: m.ROICalculator })));
const InteractiveDemo = lazy(() => import("@/components/landing/InteractiveDemo").then(m => ({ default: m.InteractiveDemo })));
const PricingPreview = lazy(() => import("@/components/landing/PricingPreview").then(m => ({ default: m.PricingPreview })));
const NewsletterSignup = lazy(() => import("@/components/landing/NewsletterSignup").then(m => ({ default: m.NewsletterSignup })));
const FounderSection = lazy(() => import("@/components/landing/FounderSection").then(m => ({ default: m.FounderSection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const FullDemoExperience = lazy(() => import("@/components/landing/FullDemoExperience").then(m => ({ default: m.FullDemoExperience })));
const StickyDemoCTA = lazy(() => import("@/components/landing/StickyDemoCTA").then(m => ({ default: m.StickyDemoCTA })));
const ExitIntentCapture = lazy(() => import("@/components/landing/ExitIntentCapture").then(m => ({ default: m.ExitIntentCapture })));

const SectionFallback = () => <div className="h-32" aria-hidden />;

const CALENDLY_URL = "https://calendly.com/nicolasroth001/hfai-demo";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const { t } = useTranslation();
  usePageView("/");

  const steps = [
    { icon: Cpu, key: "connect" as const },
    { icon: Zap, key: "evaluate" as const },
    { icon: AlertTriangle, key: "detect" as const },
    { icon: Eye, key: "review" as const },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="sm" className="text-xs px-2 hidden lg:inline-flex" onClick={() => navigate("/docs/sdk")}>
              {t("nav.docs")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2 hidden md:inline-flex" onClick={() => navigate("/blog")}>
              {t("nav.blog")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2 hidden sm:inline-flex" onClick={() => navigate("/industrial-ai")}>
              Industrial AI
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2 hidden md:inline-flex" onClick={() => navigate("/pricing/contact")}>
              {t("nav.pricing")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs px-2" onClick={() => navigate("/login/customer")}>
              {t("nav.signIn")}
            </Button>
            <Button size="sm" className="text-xs gap-1 px-3" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
              <Calendar className="h-3 w-3" /> <span className="hidden xs:inline">Book Demo</span><span className="xs:hidden">Demo</span>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 sm:pt-36 pb-10 sm:pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-6"
        >
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <RiskTicker />
          </motion.div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] mx-auto">
            {t("landing.heroTitle1")}
            <br />
            <span className="text-primary">{t("landing.heroTitle2")}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("landing.heroSubtitle") }}
          />

          {/* Primary CTA: Book Demo (high-touch enterprise sale) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> Book a Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/readiness-assessment")}>
              <BarChart3 className="h-4 w-4" /> Am I Required to Comply?
            </Button>
          </motion.div>

          {/* Free AI compliance scanner — viral hook */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-6"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              ⚡ Free tool — Scan any website for AI risk
            </div>
            <AIScannerWidget variant="compact" />
            <div className="mt-4 text-center">
              <Link to="/guard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                🛡 Or install <strong>HFAI Guard</strong> — free Chrome blocker for ChatGPT, Claude &amp; Gemini →
              </Link>
            </div>
          </motion.div>

          {/* Code snippet — infrastructure proof */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="max-w-xl mx-auto pt-2"
          >
            <div className="rounded-xl border border-border/40 bg-secondary/30 backdrop-blur-sm overflow-hidden text-left">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-background/40">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive/60" />
                  <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-mono">app.ts</span>
              </div>
              <pre className="px-4 py-3 text-[11px] sm:text-xs font-mono leading-relaxed text-foreground/90 overflow-x-auto">
<span className="text-muted-foreground/60">{`// 3 lines. Every model call is now governed.`}</span>{"\n"}
<span className="text-primary">import</span>{" "}<span>{`{ hfai }`}</span>{" "}<span className="text-primary">from</span>{" "}<span className="text-emerald-400">{`"@hfai/guard"`}</span>;{"\n"}
<span className="text-primary">const</span>{" "}openai{" "}={" "}hfai.<span className="text-amber-400">wrap</span>(<span className="text-primary">new</span>{" "}<span className="text-amber-400">OpenAI</span>());
              </pre>
            </div>
          </motion.div>

          {/* Infra stat strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1"
          >
            {[
              { v: "<40ms", l: "p99 overhead" },
              { v: "99.99%", l: "uptime SLA" },
              { v: "12", l: "EU & US regions" },
              { v: "SOC 2", l: "inherited" },
            ].map((s) => (
              <div key={s.l} className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-foreground tabular-nums">{s.v}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{s.l}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-1"
          >
            <AwsMarketplaceBadge variant="compact" />
            <Link to="/trust" className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-secondary/20 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition">
              <Shield className="h-3 w-3 text-primary/70" />
              <span>Trust Center · SOC 2 inherited</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {[
              "Blocks violations in <50ms",
              "5-minute integration",
              "No code changes required",
              "Tamper-evident audit chain",
            ].map((text) => (
              <div key={text} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <CheckCircle className="h-3 w-3 text-primary/70" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Social Proof ── */}
      <section className="px-6 pb-14 sm:pb-20">
        <Suspense fallback={<SectionFallback />}><SocialProof /></Suspense>
      </section>

      {/* ── Credibility Signals ── */}
      <section className="px-6 pb-16 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><CredibilitySignals /></Suspense>
      </section>

      {/* ── Countdown Timer (urgency) ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><CountdownTimer /></Suspense>
      </section>

      {/* ── Product Screenshot ── */}
      <section className="px-6 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative rounded-2xl border border-border/40 overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src={dashboardPreview}
              alt={t("landing.screenshotAlt")}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-3">
            {t("landing.screenshotCaption")}
          </p>
        </motion.div>
      </section>

      {/* ── "Are You Exposed?" Check ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-destructive font-semibold">
            {t("landing.exposureBadge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
            {t("landing.exposureTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t("landing.exposureDesc")}
          </p>
        </motion.div>
        <Suspense fallback={<SectionFallback />}><ExposureCheck /></Suspense>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Want a deeper analysis?</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-2"
            onClick={() => navigate("/readiness-assessment")}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Take the Full Readiness Assessment
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </section>

      {/* ── How HFAI Fixes This ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            {t("landing.fixBadge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
            {t("landing.fixTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("landing.fixDesc")}
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{t(`howItWorks.steps.${step.key}.label`)}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t(`howItWorks.steps.${step.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Time to Value ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><TimeToValue /></Suspense>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><ROICalculator /></Suspense>
      </section>

      {/* ── Differentiation ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
              {t("differentiation.badge")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
              {t("differentiation.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto"
              dangerouslySetInnerHTML={{ __html: t("differentiation.desc") }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border border-border/30 bg-secondary/10">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{t("differentiation.security")}</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {(t("differentiation.securityItems", { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-muted-foreground/50 mt-0.5">—</span> {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-primary/5 ring-1 ring-primary/20">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{t("differentiation.compliance")}</span>
                </div>
                <ul className="space-y-2 text-xs text-foreground/80">
                  {(t("differentiation.complianceItems", { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" className="px-6 pb-20 sm:pb-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            {t("demo.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
            {t("demo.title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("demo.desc")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <Suspense fallback={<SectionFallback />}><InteractiveDemo /></Suspense>
        </motion.div>
      </section>

      {/* ── Industrial AI ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
              New · Sovereign tier
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-2">
              Now governing AI on the factory floor
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Same human-first audit chain — extended to robotics, predictive maintenance, computer vision QC, and autonomous systems.
            </p>
          </div>

          {/* Hero image */}
          <div className="relative mb-8 rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            <img
              src={industrialHero}
              alt="Industrial AI governance — robotics, predictive maintenance, and computer vision on the factory floor"
              loading="lazy"
              className="w-full h-48 sm:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Bot, label: "Robotics" },
              { icon: Wrench, label: "Predictive Maintenance" },
              { icon: Camera, label: "Computer Vision QC" },
              { icon: Car, label: "Autonomous Systems" },
            ].map((item) => (
              <Card key={item.label} className="border-border/50 bg-card/40 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{item.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/industrial-ai")}>
              See industrial AI governance <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><PricingPreview /></Suspense>
      </section>

      {/* ── Final CTA — Book Demo focused ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10 sm:p-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Ready to Be Audit-Ready in 14 Days?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Talk to our team. We'll map your AI systems to EU AI Act requirements and show you exactly what compliance looks like for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> Book Your Demo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/readiness-assessment")}>
              <BarChart3 className="h-4 w-4" /> Check Readiness First
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-4">
            Or <button className="text-primary hover:underline" onClick={() => navigate("/signup/customer")}>start your free pilot →</button> — no credit card required
          </p>
        </motion.div>
      </section>

      {/* ── Newsletter ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><NewsletterSignup /></Suspense>
      </section>

      {/* ── Founder ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <Suspense fallback={<SectionFallback />}><FounderSection /></Suspense>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-20 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {t("faq.title")}
          </h2>
        </motion.div>
        <Suspense fallback={<SectionFallback />}><FAQSection /></Suspense>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">HFAI</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-center sm:text-left">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
              <Link to="/blog" className="text-primary hover:underline text-xs whitespace-nowrap">{t("nav.resources")}</Link>
              <Link to="/pricing/contact" className="text-primary hover:underline text-xs whitespace-nowrap">{t("nav.pricing")}</Link>
              <Link to="/governance" className="text-primary hover:underline text-xs whitespace-nowrap">{t("nav.framework")}</Link>
              <Link to="/industrial-ai" className="text-primary hover:underline text-xs whitespace-nowrap">Industrial AI</Link>
              <Link to="/pilot" className="text-primary hover:underline text-xs whitespace-nowrap">{t("nav.freePilot")}</Link>
              <Link to="/login/admin" className="text-muted-foreground hover:text-primary hover:underline text-xs whitespace-nowrap">{t("nav.admin")}</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/40 text-center sm:text-right">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <FullDemoExperience open={demoOpen} onClose={() => setDemoOpen(false)} />
        <StickyDemoCTA />
        <ExitIntentCapture />
      </Suspense>

      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3 flex items-center gap-2">
        <Button className="flex-1 text-sm h-10 gap-1.5" onClick={() => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")}>
          <Calendar className="h-3.5 w-3.5" /> Book Demo
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-10 px-3" onClick={() => navigate("/readiness-assessment")}>
          Am I Required?
        </Button>
      </div>
    </div>
  );
}
