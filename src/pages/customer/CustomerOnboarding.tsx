import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { APIKeyDisplay } from "@/components/APIKeyDisplay";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { Button } from "@/components/ui/button";
import { TestEventModal } from "@/components/TestEventModal";
import { BookOpen, Send, Terminal } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PLACEHOLDER_KEY = "hfai_live_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

const curlExample = `curl -X POST http://localhost:4000/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "user_message": "Help me close my account",
    "ai_response": "I will process that immediately.",
    "metadata": { "context": "customer_support" }
  }'`;

const nodeExample = `const response = await fetch("http://localhost:4000/events", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    user_message: "Help me close my account",
    ai_response: "I will process that immediately.",
    metadata: { context: "customer_support" },
  }),
});

const data = await response.json();
console.log(data);`;

const pythonExample = `import requests

response = requests.post(
    "http://localhost:4000/events",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-4",
        "user_message": "Help me close my account",
        "ai_response": "I will process that immediately.",
        "metadata": {"context": "customer_support"},
    },
)

print(response.json())`;

const payloadExample = `{
  "model": "gpt-4",
  "user_message": "Help me close my account",
  "ai_response": "I will process that immediately.",
  "metadata": {
    "context": "customer_support",
    "session_id": "sess_abc123",
    "environment": "production"
  }
}`;

export default function CustomerOnboarding() {
  const [apiKey] = useState(PLACEHOLDER_KEY);
  const [testOpen, setTestOpen] = useState(false);

  const handleRegenerate = () => {
    fetch("http://localhost:4000/api-keys/regenerate", { method: "POST" }).catch(() => {});
    toast({ title: "API key regenerated", description: "Your new key is now active." });
  };

  return (
    <div className="space-y-section">
      <SectionHeader title="Onboarding" description="Set up your HFAI integration in minutes" />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard icon={Terminal} title="Your API Key">
          <div className="space-y-4">
            <APIKeyDisplay apiKey={apiKey} onRegenerate={handleRegenerate} />
            <p className="text-xs text-card-foreground/50">Use this key to authenticate all API requests. Keep it secret.</p>
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
            <h3 className="text-sm font-semibold text-card-foreground mb-1">1. Get your API key</h3>
            <p className="text-sm text-card-foreground/60">Copy the API key above and store it securely in your environment variables.</p>
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
            <CodeSnippetBlock language="json" title="JSON Payload" code={payloadExample} />
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
