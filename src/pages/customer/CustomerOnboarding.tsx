import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { BookOpen, Send, Terminal } from "lucide-react";

const curlExample = `curl -X POST http://localhost:4000/ai-events \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "user_message",
    "payload": "Help me close my account"
  }'`;

const nodeExample = `const response = await fetch("http://localhost:4000/ai-events", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
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
        "x-api-key": "YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "event_type": "user_message",
        "payload": "Help me close my account",
    },
)

print(response.json())`;

const payloadExample = `{
  "event_type": "user_message",
  "payload": "Help me close my account"
}`;

export default function CustomerOnboarding() {
  const [testOpen, setTestOpen] = useState(false);

  return (
    <div className="space-y-section">
      <SectionHeader title="Onboarding" description="Set up your HFAI integration in minutes" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={Terminal} title="API Key">
          <div className="space-y-4">
            <p className="text-sm text-card-foreground/70">
              Create an AI System via the <strong>AI Systems</strong> page to receive your API key.
              The key is shown once on creation — store it securely.
            </p>
          </div>
        </ContentCard>

        <ContentCard icon={Send} title="Quick Test">
          <div className="space-y-4">
            <p className="text-sm text-card-foreground/70">Send a test event to verify your integration is working correctly.</p>
            <Button onClick={() => setTestOpen(true)} className="w-full gap-2">
              <Send className="h-4 w-4" /> Send Test Event
            </Button>
          </div>
        </ContentCard>
      </div>

      <TestEventModal open={testOpen} onOpenChange={setTestOpen} />

      <ContentCard icon={BookOpen} title="Integration Guide" fullWidth>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-1">1. Register an AI System</h3>
            <p className="text-sm text-card-foreground/60">Go to AI Systems → Register System. You'll receive an API key (x-api-key) on creation.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">2. Send AI events to HFAI</h3>
            <div className="space-y-4">
              <CodeSnippetBlock language="bash" title="cURL" code={curlExample} />
              <CodeSnippetBlock language="javascript" title="Node.js" code={nodeExample} />
              <CodeSnippetBlock language="python" title="Python" code={pythonExample} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-3">3. Example JSON Payload</h3>
            <CodeSnippetBlock language="json" title="POST /ai-events" code={payloadExample} />
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
