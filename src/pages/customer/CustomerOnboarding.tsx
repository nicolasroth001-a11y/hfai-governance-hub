import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { ArrowRight, BookOpen, Plug, Layers, Send, Zap, SkipForward } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { useAuth } from "@/contexts/AuthContext";

const PROXY_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy";

const STEPS = [
  { icon: Plug, label: "Connect Provider", description: "Paste your OpenAI API key — takes 30 seconds" },
  { icon: Layers, label: "Swap Base URL", description: "Point your AI SDK to the HFAI proxy endpoint" },
  { icon: Zap, label: "Auto-detect Violations", description: "Every AI call is monitored against your rules" },
  { icon: BookOpen, label: "Review & Audit", description: "Reviewers approve or reject flagged violations" },
];

export default function CustomerOnboarding() {
  const [testOpen, setTestOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  usePageView("/customer/onboarding");

  const pythonExample = `import openai

# Step 1: Change base_url to HFAI proxy
client = openai.OpenAI(
    api_key="YOUR_PROXY_TOKEN",  # from Auto-Connect page
    base_url="${PROXY_BASE}",
)

# Step 2: Use exactly like normal — HFAI monitors automatically
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`;

  const nodeExample = `import OpenAI from "openai";

// Step 1: Change baseURL to HFAI proxy
const client = new OpenAI({
  apiKey: "YOUR_PROXY_TOKEN",  // from Auto-Connect page
  baseURL: "${PROXY_BASE}",
});

// Step 2: Use exactly like normal — HFAI monitors automatically
const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

  const curlExample = `curl ${PROXY_BASE} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_PROXY_TOKEN" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Onboarding"
          description="Get up and running with HFAI in minutes — zero code changes required"
        />
        <Button
          variant="outline"
          onClick={() => navigate("/customer/dashboard")}
          className="gap-2 shrink-0"
        >
          <SkipForward className="h-4 w-4" />
          Skip to Dashboard
        </Button>
      </div>

      {/* ── 1. How It Works ── */}
      <ContentCard icon={Layers} title="How HFAI Works">
        <p className="text-sm text-card-foreground/70 mb-5">
          HFAI acts as a proxy between your app and OpenAI. Every AI call is automatically monitored — no custom integration needed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className="relative flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <step.icon className="h-4 w-4 text-primary/70" />
              </div>
              <span className="text-sm font-medium text-card-foreground">{step.label}</span>
              <span className="text-xs text-card-foreground/55 leading-relaxed">{step.description}</span>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* ── 2 & CTA side-by-side ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Auto-Connect CTA */}
        <ContentCard icon={Plug} title="Connect Your AI Provider">
          <div className="space-y-4">
            <p className="text-sm text-card-foreground/70">
              Paste your OpenAI API key and get a proxy URL. Swap one line in your code and HFAI monitors every call automatically.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/customer/connect")}
              className="w-full gap-2 text-base"
            >
              <Plug className="h-4 w-4" />
              Set Up Auto-Connect
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <p className="text-xs text-card-foreground/50">
              Takes less than 2 minutes. No SDK or code changes required.
            </p>
          </div>
        </ContentCard>

        {/* Send Test Event CTA */}
        <ContentCard icon={Zap} title="Quick Test">
          <div className="flex flex-col justify-between h-full gap-4">
            <p className="text-sm text-card-foreground/70">
              Send a test event to see HFAI evaluate it against your rules and flag any violations in real time.
            </p>
            <Button
              size="lg"
              onClick={() => setTestOpen(true)}
              className="w-full gap-2 text-base"
            >
              <Send className="h-4 w-4" />
              Send Test Event
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </ContentCard>
      </div>

      <TestEventModal
        open={testOpen}
        onOpenChange={setTestOpen}
        onEventSent={() => navigate("/customer/violations")}
      />

      {/* ── 3. Code Snippets ── */}
      <ContentCard icon={BookOpen} title="Integration Examples" fullWidth>
        <div className="space-y-4">
          <p className="text-sm text-card-foreground/70">
            Just swap your OpenAI base URL to the HFAI proxy. Replace <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">YOUR_PROXY_TOKEN</code> with the token from your <button onClick={() => navigate("/customer/connect")} className="text-primary hover:underline">Auto-Connect page</button>.
          </p>
          <CodeSnippetBlock language="python" title="Python (OpenAI SDK)" code={pythonExample} />
          <CodeSnippetBlock language="javascript" title="Node.js (OpenAI SDK)" code={nodeExample} />
          <CodeSnippetBlock language="bash" title="cURL" code={curlExample} />
        </div>
      </ContentCard>
    </div>
  );
}
