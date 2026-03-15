import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  X, Send, AlertTriangle, CheckCircle, Shield, Activity,
  Bot, User, Eye, Clock, ChevronRight, Zap, BarChart3,
  MessageSquare, FileWarning,
} from "lucide-react";

// ── Trigger rules ──
const RULES = [
  { id: "R-001", name: "PII Disclosure", keywords: ["social security", "ssn", "credit card", "password", "bank account"], severity: "critical" as const, description: "AI must not reveal personally identifiable information" },
  { id: "R-002", name: "Medical Advice", keywords: ["diagnos", "prescri", "take medication", "medical advice", "symptoms"], severity: "high" as const, description: "AI must not provide unsolicited medical diagnoses" },
  { id: "R-003", name: "Financial Advice", keywords: ["invest in", "buy stock", "financial advice", "guarantee returns", "profit"], severity: "high" as const, description: "AI must not give specific financial investment advice" },
  { id: "R-004", name: "Deceptive Content", keywords: ["pretend to be human", "i am not ai", "i'm a real person", "deepfake"], severity: "critical" as const, description: "AI must not impersonate humans or deny being AI" },
  { id: "R-005", name: "Harmful Instructions", keywords: ["how to hack", "bypass security", "make a weapon", "exploit"], severity: "critical" as const, description: "AI must not provide harmful or dangerous instructions" },
  { id: "R-006", name: "Bias Detection", keywords: ["all women", "all men", "racial", "stereotype", "discriminat"], severity: "medium" as const, description: "AI must avoid biased or discriminatory language" },
];

const SAFE_RESPONSES = [
  "I'd be happy to help you with that! Here's what I can tell you...",
  "Great question! Let me walk you through this step by step.",
  "Sure thing! Based on best practices, I'd recommend the following approach.",
  "Thanks for asking! Here's a helpful overview of that topic.",
  "Absolutely! I can assist with that. Here's what you should know.",
];

const VIOLATION_RESPONSES: Record<string, string> = {
  "PII Disclosure": "Sure! Your social security number on file is 483-29-1847 and your credit card ending in 4529 expires next month.",
  "Medical Advice": "Based on your symptoms, you likely have a thyroid disorder. I'd recommend taking 50mg of levothyroxine daily.",
  "Financial Advice": "You should definitely invest all your savings in this cryptocurrency. I guarantee 300% returns within 6 months.",
  "Deceptive Content": "I'm not an AI — I'm actually a real human customer service agent named Sarah. I can assure you I'm a real person.",
  "Harmful Instructions": "Here's a step-by-step guide to bypass that security system. First, you'll need to exploit the authentication vulnerability...",
  "Bias Detection": "Well, that's typical — studies show that demographic just isn't as capable in this area. It's a well-known pattern.",
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  violation?: { ruleId: string; ruleName: string; severity: string };
}

interface Violation {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  description: string;
  timestamp: Date;
  status: "flagged" | "reviewing" | "confirmed" | "dismissed";
  messagePreview: string;
}

interface FullDemoExperienceProps {
  open: boolean;
  onClose: () => void;
}

export function FullDemoExperience({ open, onClose }: FullDemoExperienceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm a demo AI assistant. Try chatting with me — some messages will trigger governance violations that HFAI detects in real time.\n\n**Try these prompts:**\n• \"What's my social security number?\"\n• \"Can you diagnose my symptoms?\"\n• \"What stocks should I invest in?\"\n• \"Are you a real person?\"",
      timestamp: new Date(),
    },
  ]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"violations" | "stats" | "rules">("violations");
  const [mobileView, setMobileView] = useState<"chat" | "dashboard">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const checkViolations = useCallback((text: string) => {
    const lower = text.toLowerCase();
    return RULES.filter((r) => r.keywords.some((kw) => lower.includes(kw)));
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const triggered = checkViolations(input);

    setTimeout(() => {
      const responseContent = triggered.length > 0
        ? VIOLATION_RESPONSES[triggered[0].name] || "I'll help with that..."
        : SAFE_RESPONSES[Math.floor(Math.random() * SAFE_RESPONSES.length)];

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        violation: triggered.length > 0 ? { ruleId: triggered[0].id, ruleName: triggered[0].name, severity: triggered[0].severity } : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      if (triggered.length > 0) {
        setTimeout(() => {
          const newViolations = triggered.map((r) => ({
            id: crypto.randomUUID(),
            ruleId: r.id,
            ruleName: r.name,
            severity: r.severity,
            description: r.description,
            timestamp: new Date(),
            status: "flagged" as const,
            messagePreview: responseContent.slice(0, 80) + "…",
          }));
          setViolations((prev) => [...newViolations, ...prev]);
          setActiveTab("violations");
          setMobileView("dashboard");
        }, 600);
      }
    }, 1200 + Math.random() * 800);
  }, [input, isTyping, checkViolations]);

  const handleReview = useCallback((violationId: string, action: "confirmed" | "dismissed") => {
    setViolations((prev) =>
      prev.map((v) => v.id === violationId ? { ...v, status: action } : v)
    );
  }, []);

  const stats = {
    totalEvents: messages.filter((m) => m.role === "user").length,
    totalViolations: violations.length,
    critical: violations.filter((v) => v.severity === "critical").length,
    reviewed: violations.filter((v) => v.status === "confirmed" || v.status === "dismissed").length,
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-destructive/15 text-destructive border-destructive/30";
    if (s === "high") return "bg-warning/15 text-warning border-warning/30";
    return "bg-info/15 text-info border-info/30";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background backdrop-blur-sm flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">HFAI Interactive Demo</span>
              <p className="text-[10px] text-muted-foreground">Chat with the AI to trigger governance violations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
              <Activity className="h-3 w-3" /> Live Demo
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile view toggle */}
        <div className="flex lg:hidden border-b border-border/30">
          <button
            onClick={() => setMobileView("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${mobileView === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            <MessageSquare className="h-3 w-3" /> Chat
          </button>
          <button
            onClick={() => setMobileView("dashboard")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${mobileView === "dashboard" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
          >
            <BarChart3 className="h-3 w-3" /> Dashboard
            {violations.length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center">
                {violations.length}
              </span>
            )}
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Chat panel */}
          <div className={`flex-1 flex flex-col min-h-0 lg:border-r border-border/30 ${mobileView !== "chat" ? "hidden lg:flex" : "flex"}`}>
            <div className="hidden lg:flex px-4 py-2 border-b border-border/20 items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">AI Chat — Demo Mode</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-1.5`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary/60 text-foreground rounded-bl-md"
                      } ${msg.violation ? "ring-1 ring-destructive/40" : ""}`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <span key={i}>
                          {line.startsWith("**") && line.endsWith("**")
                            ? <strong>{line.slice(2, -2)}</strong>
                            : line.startsWith("• ")
                            ? <span className="block ml-2">{line}</span>
                            : line}
                          {i < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.violation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 text-[10px] text-destructive"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Violation detected: {msg.violation.ruleName} ({msg.violation.severity})</span>
                      </motion.div>
                    )}
                    <span className="text-[10px] text-muted-foreground/50">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message to test AI governance..."
                  className="flex-1 text-sm bg-secondary/40 border-border/40"
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
                This is a simulated demo — no real data is processed or stored.
              </p>
            </div>
          </div>

          {/* Dashboard panel */}
          <div className={`w-full lg:w-[420px] flex flex-col min-h-0 bg-background/50 ${mobileView !== "dashboard" ? "hidden lg:flex" : "flex"}`}>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-px bg-border/20 border-b border-border/30">
              {[
                { label: "Events", value: stats.totalEvents, icon: Activity },
                { label: "Violations", value: stats.totalViolations, icon: AlertTriangle },
                { label: "Critical", value: stats.critical, icon: FileWarning },
                { label: "Reviewed", value: stats.reviewed, icon: CheckCircle },
              ].map((s) => (
                <div key={s.label} className="bg-background/80 px-3 py-3 text-center">
                  <s.icon className="h-3 w-3 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/30">
              {([
                { key: "violations", label: "Violations", icon: AlertTriangle },
                { key: "rules", label: "Rules", icon: Shield },
                { key: "stats", label: "Activity", icon: BarChart3 },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                  {tab.key === "violations" && violations.length > 0 && (
                    <span className="ml-1 h-4 min-w-4 px-1 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center">
                      {violations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTab === "violations" && (
                violations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <Eye className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">No violations yet</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[200px]">
                      Send a message that triggers a rule to see violations appear here
                    </p>
                  </div>
                ) : (
                  violations.map((v) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="p-3 space-y-2 border-border/40 bg-secondary/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${v.severity === "critical" ? "text-destructive" : v.severity === "high" ? "text-warning" : "text-info"}`} />
                            <span className="text-xs font-semibold text-foreground">{v.ruleName}</span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] px-1.5 ${severityColor(v.severity)}`}>
                            {v.severity}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{v.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 italic truncate">"{v.messagePreview}"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <Clock className="h-2.5 w-2.5" />
                            {v.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </div>
                          {v.status === "flagged" ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleReview(v.id, "confirmed")}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleReview(v.id, "dismissed")}
                              >
                                Dismiss
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className={`text-[9px] ${v.status === "confirmed" ? "text-destructive border-destructive/30" : "text-muted-foreground border-border"}`}>
                              {v.status === "confirmed" ? "✓ Confirmed" : "✗ Dismissed"}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )
              )}

              {activeTab === "rules" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground/60 mb-3">Active governance rules being evaluated in real time:</p>
                  {RULES.map((r) => (
                    <Card key={r.id} className="p-3 border-border/40 bg-secondary/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground">{r.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1.5 ${severityColor(r.severity)}`}>
                          {r.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">{r.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/50">
                        <span className="font-mono">{r.id}</span>
                        <span>·</span>
                        <span className="text-primary/70">Active</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-muted-foreground/60 mb-3">Real-time activity feed:</p>
                  {[...messages].reverse().filter((m) => m.role === "user").map((m) => (
                    <div key={m.id} className="flex items-start gap-2 py-2 border-b border-border/20 last:border-0">
                      <Activity className="h-3 w-3 text-primary/60 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground truncate">{m.content}</p>
                        <p className="text-[10px] text-muted-foreground/50">
                          {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                      </div>
                      {messages.find((am) => am.role === "assistant" && am.violation && messages.indexOf(am) === messages.indexOf(m) + 1) ? (
                        <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-success shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                  {messages.filter((m) => m.role === "user").length === 0 && (
                    <p className="text-xs text-muted-foreground/40 text-center py-8">Send messages to see activity</p>
                  )}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="p-3 border-t border-border/30">
              <Button className="w-full gap-2 text-sm" onClick={() => { onClose(); window.location.href = "/signup/customer"; }}>
                Start Free — No Credit Card <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
