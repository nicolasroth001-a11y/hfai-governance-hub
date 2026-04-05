import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Activity, AlertTriangle, UserCheck, ChevronRight,
  Cpu, Zap, Eye, CheckCircle, Brain, ArrowRight, Scale, Clock, Star, BookOpen, Calendar,
} from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { StatsBar } from "@/components/landing/StatsBar";
import { FAQSection } from "@/components/landing/FAQSection";
import { FullDemoExperience } from "@/components/landing/FullDemoExperience";
import { ComplianceCalculator } from "@/components/landing/ComplianceCalculator";
import { UseCaseCards } from "@/components/landing/UseCaseCards";
import { LeadCapture } from "@/components/landing/LeadCapture";
import { CountdownTimer } from "@/components/landing/CountdownTimer";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { BookDemoCTA } from "@/components/landing/BookDemoCTA";
import { FounderSection } from "@/components/landing/FounderSection";
import { StickyDemoCTA } from "@/components/landing/StickyDemoCTA";
import { CredibilitySignals } from "@/components/landing/CredibilitySignals";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import dashboardPreview from "@/assets/dashboard-preview.png";

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

  const values = [
    { icon: Activity, key: "monitoring" as const },
    { icon: AlertTriangle, key: "detection" as const },
    { icon: UserCheck, key: "oversight" as const },
    { icon: Brain, key: "rca" as const },
  ];

  const steps = [
    { icon: Cpu, key: "connect" as const },
    { icon: Zap, key: "evaluate" as const },
    { icon: AlertTriangle, key: "detect" as const },
    { icon: Eye, key: "review" as const },
  ];

  const trustPoints = [
    t("trust.encryption"),
    t("trust.soc2"),
    t("trust.setup"),
    t("trust.ready"),
  ];

  const pilotIncludes = [
    { icon: Cpu, key: "systems" as const },
    { icon: Scale, key: "compliance" as const },
    { icon: UserCheck, key: "onboarding" as const },
    { icon: Shield, key: "report" as const },
  ];

  const euArticles = [
    { article: "Art. 9", key: "art9" as const },
    { article: "Art. 12", key: "art12" as const },
    { article: "Art. 13", key: "art13" as const },
    { article: "Art. 14", key: "art14" as const },
    { article: "Art. 15", key: "art15" as const },
    { article: "Art. 61", key: "art61" as const },
  ];

  const nistFunctions = [
    { fn: "GOVERN", key: "govern" as const, color: "text-primary" },
    { fn: "MAP", key: "map" as const, color: "text-blue-500" },
    { fn: "MEASURE", key: "measure" as const, color: "text-emerald-500" },
    { fn: "MANAGE", key: "manage" as const, color: "text-amber-500" },
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
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex" onClick={() => navigate("/docs/sdk")}>
              {t("nav.docs")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/blog")}>
              {t("nav.blog")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs hidden sm:inline-flex" onClick={() => navigate("/pricing/contact")}>
              {t("nav.pricing")}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/login/customer")}>
              {t("nav.signIn")}
            </Button>
            <Button size="sm" className="text-xs gap-1 bg-primary hover:bg-primary/90 hidden sm:inline-flex" onClick={() => window.open("https://calendly.com/nicolasroth001/hfai-demo", "_blank", "noopener,noreferrer")}>
              <Calendar className="h-3 w-3" /> {t("bookDemo.cta")}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 sm:pt-40 pb-16 sm:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">{t("hero.badge")}</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
            {t("hero.title1")}
            <br />
            <span className="text-primary">{t("hero.title2")}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 justify-center items-center"
          >
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => window.open("https://calendly.com/nicolasroth001/hfai-demo", "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> {t("bookDemo.cta")} <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 gap-2" onClick={() => setDemoOpen(true)}>
              <Eye className="h-4 w-4" /> {t("hero.demo")}
            </Button>
            <Button size="lg" variant="ghost" className="text-base px-8 h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              {t("hero.cta")}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-8"
          >
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <CheckCircle className="h-3 w-3 text-primary/70" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Product Preview ── */}
      <section className="px-6 pb-24">
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
              alt="HFAI Dashboard — AI governance monitoring with violation alerts, analytics, and human review queue"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </motion.div>
      </section>

      {/* ── Countdown Timer ── */}
      <section className="px-6 pb-24">
        <CountdownTimer />
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <StatsBar />
        </div>
      </section>

      {/* ── Credibility Signals ── */}
      <section className="px-6 pb-24">
        <CredibilitySignals />
      </section>

      {/* ── Pilot CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 sm:p-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">{t("pilot.badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
                dangerouslySetInnerHTML={{ __html: t("pilot.title").replace(/<1>(.*?)<\/1>/g, '<span class="text-primary">$1</span>') }}
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("pilot.desc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pilotIncludes.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <item.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{t(`pilot.includes.${item.key}`)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button size="lg" className="gap-2" onClick={() => navigate("/signup/customer")}>
                  {t("pilot.cta")} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/pilot")}>
                  {t("pilot.whiteGlove")}
                </Button>
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-2 text-center p-6 rounded-xl border border-border/30 bg-background/50">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("pilot.whiteGloveTitle")}</p>
              <p className="text-[11px] text-muted-foreground max-w-[160px]">{t("pilot.whiteGloveDesc")}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Value Propositions ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("values.sectionTitle")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("values.sectionDesc")}
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-2">
          {values.map((v, i) => (
            <motion.div
              key={v.key}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card className="border border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/20 transition-all duration-300 h-full group">
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-semibold">
                    {t(`values.${v.key}.highlight`)}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{t(`values.${v.key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`values.${v.key}.description`)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Differentiation ── */}
      <section className="px-6 pb-24">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            {t("differentiation.footer")}
          </p>
        </motion.div>
      </section>

      {/* ── Use Cases ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            {t("useCases.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
            {t("useCases.title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("useCases.desc")}
          </p>
        </motion.div>
        <UseCaseCards />
      </section>

      {/* ── Dual Compliance ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">{t("compliance.badge")}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
              {t("compliance.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              {t("compliance.desc")}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇪🇺</span>
              <span className="text-xs font-semibold text-foreground">{t("compliance.euLabel")}</span>
              <span className="text-[10px] text-muted-foreground">{t("compliance.euSubtext")}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {euArticles.map((item) => (
                <Card key={item.article} className="border border-border/30 bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-primary/70">{item.article}</span>
                      <span className="text-sm font-semibold text-foreground">{t(`compliance.articles.${item.key}.label`)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(`compliance.articles.${item.key}.desc`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🇺🇸</span>
              <span className="text-xs font-semibold text-foreground">{t("compliance.nistLabel")}</span>
              <span className="text-[10px] text-muted-foreground">{t("compliance.nistSubtext")}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nistFunctions.map((item) => (
                <Card key={item.fn} className="border border-border/30 bg-secondary/10">
                  <CardContent className="p-4">
                    <span className={`text-[10px] font-mono font-bold ${item.color}`}>{item.fn}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{t(`compliance.nistFunctions.${item.key}`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate("/governance")}>
              {t("compliance.euDetails")} <ArrowRight className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate("/nist-ai-rmf")}>
              {t("compliance.nistDetails")} <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Compliance Calculator ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("calculator.sectionTitle")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            {t("calculator.sectionDesc")}
          </p>
        </motion.div>
        <ComplianceCalculator />
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("howItWorks.desc")}
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

      {/* ── Interactive Demo ── */}
      <section id="demo" className="px-6 pb-24 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            {t("demo.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mt-2">
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
          <InteractiveDemo />
        </motion.div>
      </section>

      {/* ── Post-Demo Signup CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 sm:p-10"
        >
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {t("postDemo.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t("postDemo.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => window.open("https://calendly.com/nicolasroth001/hfai-demo", "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> {t("bookDemo.cta")} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" className="text-base h-12 gap-2" onClick={() => navigate("/signup/customer")}>
              {t("postDemo.cta")}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            {[t("postDemo.noCreditCard"), t("postDemo.freeTier"), t("postDemo.twoMinSetup")].map(txt => (
              <span key={txt} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-primary/70" /> {txt}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Lead Capture ── */}
      <section className="px-6 pb-24">
        <LeadCapture />
      </section>

      {/* ── Newsletter Signup ── */}
      <section className="px-6 pb-24">
        <NewsletterSignup />
      </section>

      {/* ── Book a Demo ── */}
      <section className="px-6 pb-24">
        <BookDemoCTA />
      </section>

      {/* ── Founder Section ── */}
      <section className="px-6 pb-24">
        <FounderSection />
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {t("faq.title")}
          </h2>
        </motion.div>
        <FAQSection />
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center rounded-2xl border border-primary/20 bg-primary/5 p-10 sm:p-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {t("finalCta.title1")}
            <br />
            <span className="text-primary">{t("finalCta.title2")}</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            {t("finalCta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Button size="lg" className="text-base px-8 h-12 gap-2" onClick={() => window.open("https://calendly.com/nicolasroth001/hfai-demo", "_blank", "noopener,noreferrer")}>
              <Calendar className="h-4 w-4" /> {t("bookDemo.cta")} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate("/signup/customer")}>
              {t("finalCta.cta")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Blog CTA Section ── */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-2xl border border-border/40 bg-secondary/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t("blogCta.title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("blogCta.desc")}</p>
            </div>
            <Button size="lg" variant="outline" className="gap-2 shrink-0" onClick={() => navigate("/blog")}>
              {t("blogCta.cta")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
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
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-primary hover:underline text-xs">{t("nav.resources")}</Link>
              <span className="text-border/30">·</span>
              <Link to="/pricing/contact" className="text-primary hover:underline text-xs">{t("nav.pricing")}</Link>
              <span className="text-border/30">·</span>
              <Link to="/governance" className="text-primary hover:underline text-xs">{t("nav.framework")}</Link>
              <span className="text-border/30">·</span>
              <Link to="/pilot" className="text-primary hover:underline text-xs">{t("nav.freePilot")}</Link>
              <span className="text-border/30">·</span>
              <Link to="/login/admin" className="text-muted-foreground hover:text-primary hover:underline text-xs">{t("nav.admin")}</Link>
            </div>
            <p className="text-[11px] text-muted-foreground/40">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
      <FullDemoExperience open={demoOpen} onClose={() => setDemoOpen(false)} />
      <StickyDemoCTA />

      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3 flex items-center gap-2">
        <Button className="flex-1 text-sm h-10 gap-1.5" onClick={() => window.open("https://calendly.com/nicolasroth001/hfai-demo", "_blank", "noopener,noreferrer")}>
          <Calendar className="h-3.5 w-3.5" /> {t("bookDemo.cta")}
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-10 px-3" onClick={() => navigate("/signup/customer")}>
          {t("nav.startFree")}
        </Button>
      </div>
    </div>
  );
}
