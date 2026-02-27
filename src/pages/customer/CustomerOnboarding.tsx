import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { APIKeyDisplay } from "@/components/APIKeyDisplay";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { ArrowRight, BookOpen, Key, Layers, Send, Zap } from "lucide-react";

const DEMO_API_KEY = "hfai_demo_k8x2mQ9vLpR4nT6wJ1yF3bA7cE0gH5d";

const STEPS = [
  { icon: Layers, label: "Register AI System", description: "Add your AI model to HFAI for monitoring" },
  { icon: Send, label: "Send Events", description: "POST user messages via the /ai-events endpoint" },
  { icon: Zap, label: "Auto-detect Violations", description: "HFAI evaluates events against your rules" },
  { icon: BookOpen, label: "Review & Audit", description: "Reviewers approve or reject flagged violations" },
];

const curlExample = `curl -X POST http://localhost:4000/ai-events \\
  -H "x-api-key: ${DEMO_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "user_message",
    "payload": "Help me close my account"
  }'`;

const nodeExample = `const response = await fetch("http://localhost:4000/ai-events", {
  method: "POST",
  headers: {
    "x-api-key": "${DEMO_API_KEY}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    event_type: "user_message",
    payload: "Help me close my account",
  }),
});

const data = await response.json();
console.log(data);`;

const pythonExample = `import requests

response = requests.post(
    "http://localhost:4000/ai-events",
    headers={
        "x-api-key": "${DEMO_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "event_type": "user_message",
        "payload": "Help me close my account",
    },
)

print(response.json())`;

export default function CustomerOnboarding() {
  const [testOpen, setTestOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-section">
      <SectionHeader
        title="Onboarding"
        description="Get up and running with HFAI in minutes"
      />

      {/* ── 1. How It Works ── */}
      <ContentCard icon={Layers} title="How HFAI Works">
        <p className="text-sm text-card-foreground/70 mb-5">
          HFAI monitors your AI systems for policy violations in real time. Here's the flow:
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
        {/* Demo API Key */}
        <ContentCard icon={Key} title="Demo API Key">
          <div className="space-y-4">
            <p className="text-sm text-card-foreground/70">
              Use this key in the <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">x-api-key</code> header
              when calling <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">POST /ai-events</code>.
            </p>
            <APIKeyDisplay apiKey={DEMO_API_KEY} label="x-api-key" />
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
            Send AI events to HFAI from any language. Each example posts a user message and returns detected violations.
          </p>
          <CodeSnippetBlock language="bash" title="cURL" code={curlExample} />
          <CodeSnippetBlock language="javascript" title="Node.js (fetch)" code={nodeExample} />
          <CodeSnippetBlock language="python" title="Python (requests)" code={pythonExample} />
        </div>
      </ContentCard>
    </div>
  );
}
