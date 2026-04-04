import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Plug, Layers, Send, Zap, SkipForward, Key, Shield, CheckCircle, Circle } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

const PROXY_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy";
const INGEST_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event";

const PROXY_STEPS = [
  { icon: Plug, label: "Connect Provider", description: "Paste your OpenAI API key — takes 30 seconds" },
  { icon: Layers, label: "Swap Base URL", description: "Point your AI SDK to the HFAI proxy endpoint" },
  { icon: Zap, label: "Auto-detect Violations", description: "Every AI call is monitored against your rules" },
  { icon: BookOpen, label: "Review & Audit", description: "Reviewers approve or reject flagged violations" },
];

const REST_STEPS = [
  { icon: Key, label: "Get API Key", description: "Copy your REST API key from the Connect page" },
  { icon: Send, label: "Send Events", description: "POST events to HFAI after your AI responds" },
  { icon: Zap, label: "Rules Evaluate", description: "HFAI checks events against your governance rules" },
  { icon: BookOpen, label: "Review & Audit", description: "Reviewers approve or reject flagged violations" },
];

export default function CustomerOnboarding() {
  const [testOpen, setTestOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { steps, progress, completedAt, completeStep } = useOnboardingProgress();
  usePageView("/customer/onboarding");

  const pythonProxy = `import openai

# Step 1: Change base_url to HFAI proxy
client = openai.OpenAI(
    api_key="YOUR_PROXY_TOKEN",  # from Connect page
    base_url="${PROXY_BASE}",
)

# Step 2: Use exactly like normal — HFAI monitors automatically
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`;

  const pythonRest = `import requests

# After your AI generates a response, log it to HFAI
response = requests.post(
    "${INGEST_BASE}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY",  # from Connect page
    },
    json={
        "event_type": "chat_completion",
        "payload": "User asked about account deletion",
        "metadata": {"model": "claude-3", "provider": "anthropic"}
    }
)`;

  const nodeProxy = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_PROXY_TOKEN",  // from Connect page
  baseURL: "${PROXY_BASE}",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

  const nodeRest = `// After your AI generates a response, log it to HFAI
const response = await fetch("${INGEST_BASE}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",  // from Connect page
  },
  body: JSON.stringify({
    event_type: "chat_completion",
    payload: "User asked about account deletion",
    metadata: { model: "claude-3", provider: "anthropic" },
  }),
});`;

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Onboarding"
          description="Two ways to monitor your AI — pick the best fit for your setup"
        />
        <Button variant="outline" onClick={() => navigate("/customer/dashboard")} className="gap-2 shrink-0">
          <SkipForward className="h-4 w-4" /> Skip to Dashboard
        </Button>
      </div>

      {/* ── Onboarding Progress ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Setup Progress</h3>
            <span className="text-xs text-muted-foreground">
              {completedAt ? "✅ Complete!" : `${Math.round(progress * 100)}%`}
            </span>
          </div>
          <Progress value={progress * 100} className="h-2" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                {step.completed ? (
                  <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Integration Methods ── */}
      <Tabs defaultValue="proxy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="proxy" className="gap-2 text-sm">
            <Plug className="h-4 w-4" /> Proxy (Zero-Code)
          </TabsTrigger>
          <TabsTrigger value="rest" className="gap-2 text-sm">
            <Key className="h-4 w-4" /> REST API (Any AI)
          </TabsTrigger>
        </TabsList>

        {/* ── PROXY TAB ── */}
        <TabsContent value="proxy" className="space-y-6">
          <ContentCard icon={Plug} title="How the Proxy Works">
            <p className="text-sm text-card-foreground/70 mb-2">
              <strong>Best for OpenAI users.</strong> Swap your base URL — HFAI intercepts every AI call automatically. Your traffic flows through the HFAI proxy, giving full visibility into inputs and outputs with <strong>zero code changes</strong>.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PROXY_STEPS.map((step, i) => (
                <div key={step.label} className="relative flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{i + 1}</span>
                    <step.icon className="h-4 w-4 text-primary/70" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{step.label}</span>
                  <span className="text-xs text-card-foreground/55 leading-relaxed">{step.description}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard icon={BookOpen} title="Proxy Code Examples">
            <div className="space-y-4">
              <p className="text-sm text-card-foreground/70">
                Replace <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">YOUR_PROXY_TOKEN</code> with the token from your <button onClick={() => navigate("/customer/connect")} className="text-primary hover:underline">Connect page</button>.
              </p>
              <CodeSnippetBlock language="python" title="Python (OpenAI SDK)" code={pythonProxy} />
              <CodeSnippetBlock language="javascript" title="Node.js (OpenAI SDK)" code={nodeProxy} />
            </div>
          </ContentCard>
        </TabsContent>

        {/* ── REST API TAB ── */}
        <TabsContent value="rest" className="space-y-6">
          <ContentCard icon={Key} title="How the REST API Works">
            <p className="text-sm text-card-foreground/70 mb-2">
              <strong>Best for any AI provider.</strong> Works with OpenAI, Anthropic, Google, open-source, or custom models. Your AI traffic stays between you and your provider — only event metadata is sent to HFAI. <strong>Maximum data control.</strong>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {REST_STEPS.map((step, i) => (
                <div key={step.label} className="relative flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{i + 1}</span>
                    <step.icon className="h-4 w-4 text-primary/70" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{step.label}</span>
                  <span className="text-xs text-card-foreground/55 leading-relaxed">{step.description}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard icon={BookOpen} title="REST API Code Examples">
            <div className="space-y-4">
              <p className="text-sm text-card-foreground/70">
                Replace <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">YOUR_API_KEY</code> with the key from your <button onClick={() => navigate("/customer/connect")} className="text-primary hover:underline">Connect page</button>.
              </p>
              <CodeSnippetBlock language="python" title="Python" code={pythonRest} />
              <CodeSnippetBlock language="javascript" title="Node.js / TypeScript" code={nodeRest} />
            </div>
          </ContentCard>
        </TabsContent>
      </Tabs>

      {/* ── CTAs ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={Plug} title="Set Up Integration">
          <div className="space-y-4">
            <p className="text-sm text-card-foreground/70">
              Configure your Proxy or REST API connection and get your tokens.
            </p>
            <Button size="lg" onClick={() => navigate("/customer/connect")} className="w-full gap-2 text-base">
              <Plug className="h-4 w-4" /> Go to Connect Page <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </ContentCard>

        <ContentCard icon={Zap} title="Quick Test">
          <div className="flex flex-col justify-between h-full gap-4">
            <p className="text-sm text-card-foreground/70">
              Send a test event to see HFAI evaluate it against your rules and flag any violations.
            </p>
            <Button size="lg" onClick={() => setTestOpen(true)} className="w-full gap-2 text-base">
              <Send className="h-4 w-4" /> Send Test Event <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </ContentCard>
      </div>

      <TestEventModal open={testOpen} onOpenChange={setTestOpen} onEventSent={() => navigate("/customer/violations")} />
    </div>
  );
}
