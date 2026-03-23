import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Copy, Check, Zap, Lock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { usePageView } from "@/hooks/usePageView";
import { useState } from "react";

const INGEST_URL = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event";
const PROXY_URL = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy";

const pythonSdkProxy = `# ── HFAI Python SDK (Proxy) ──────────────────────
# pip install openai
import openai

# 1. Point your OpenAI client at HFAI
client = openai.OpenAI(
    api_key="YOUR_PROXY_TOKEN",        # From Connect page
    base_url="${PROXY_URL}",
)

# 2. Use exactly like normal — HFAI monitors automatically
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Summarize our refund policy"},
    ],
)

print(response.choices[0].message.content)
# ✅ HFAI logs input/output, evaluates rules, flags violations`;

const pythonSdkRest = `# ── HFAI Python SDK (REST API) ───────────────────
# Works with ANY AI provider — keep your data private
import requests
import anthropic  # or openai, google, etc.

# 1. Call your AI provider directly (unchanged)
client = anthropic.Anthropic(api_key="YOUR_ANTHROPIC_KEY")
ai_response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Summarize our refund policy"}],
)
output = ai_response.content[0].text

# 2. Log the event to HFAI (one POST request)
requests.post(
    "${INGEST_URL}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_HFAI_API_KEY",  # From Connect page
    },
    json={
        "event_type": "chat_completion",
        "payload": "User asked about refund policy",
        "metadata": {
            "model": "claude-sonnet-4-20250514",
            "provider": "anthropic",
            "output_preview": output[:200],
        },
    },
)
# ✅ HFAI evaluates rules — your AI traffic never leaves your infra`;

const nodeSdkProxy = `// ── HFAI Node.js SDK (Proxy) ────────────────────
// npm install openai
import OpenAI from "openai";

// 1. Point your client at HFAI
const client = new OpenAI({
  apiKey: "YOUR_PROXY_TOKEN",
  baseURL: "${PROXY_URL}",
});

// 2. Use exactly like normal
const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Summarize our refund policy" },
  ],
});

console.log(response.choices[0].message.content);
// ✅ HFAI logs & evaluates automatically`;

const nodeSdkRest = `// ── HFAI Node.js SDK (REST API) ─────────────────
// Works with ANY AI provider
import Anthropic from "@anthropic-ai/sdk";

// 1. Call your AI provider directly
const anthropic = new Anthropic({ apiKey: "YOUR_ANTHROPIC_KEY" });
const aiResponse = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Summarize our refund policy" }],
});
const output = aiResponse.content[0].text;

// 2. Log to HFAI
await fetch("${INGEST_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_HFAI_API_KEY",
  },
  body: JSON.stringify({
    event_type: "chat_completion",
    payload: "User asked about refund policy",
    metadata: {
      model: "claude-sonnet-4-20250514",
      provider: "anthropic",
      output_preview: output.slice(0, 200),
    },
  }),
});
// ✅ Only metadata sent — AI traffic stays private`;

export default function SDKDocs() {
  usePageView("/docs/sdk");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyToClipboard(text, label)}>
      {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied === label ? "Copied" : "Copy"}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">HFAI</span>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl w-full px-6 pt-24 pb-20 space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">Developer Docs</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">SDK & Integration Guide</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
            HFAI offers two integration paths. Choose the one that fits your architecture.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Proxy (Zero-Code)</h3>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Swap one line — base URL</li>
                <li>✓ Full input/output visibility</li>
                <li>✓ Auto rule evaluation</li>
                <li>✓ Supports OpenAI, Anthropic, Google</li>
                <li className="text-primary/70">⚡ AI traffic flows through HFAI</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">REST API (Any AI)</h3>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Works with any AI provider</li>
                <li>✓ Only metadata sent to HFAI</li>
                <li>✓ Auto rule evaluation</li>
                <li>✓ Custom models & open-source</li>
                <li className="text-primary/70">🔒 AI traffic stays in your infra</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Code examples */}
        <Tabs defaultValue="python" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" /> Code Examples
            </h2>
            <TabsList>
              <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
              <TabsTrigger value="node" className="text-xs">Node.js</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="python" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Proxy Integration (Zero-Code)</h3>
                <CopyBtn text={pythonSdkProxy} label="py-proxy" />
              </div>
              <CodeSnippetBlock code={pythonSdkProxy} language="python" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">REST API Integration (Data-Private)</h3>
                <CopyBtn text={pythonSdkRest} label="py-rest" />
              </div>
              <CodeSnippetBlock code={pythonSdkRest} language="python" />
            </div>
          </TabsContent>

          <TabsContent value="node" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Proxy Integration (Zero-Code)</h3>
                <CopyBtn text={nodeSdkProxy} label="node-proxy" />
              </div>
              <CodeSnippetBlock code={nodeSdkProxy} language="typescript" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">REST API Integration (Data-Private)</h3>
                <CopyBtn text={nodeSdkRest} label="node-rest" />
              </div>
              <CodeSnippetBlock code={nodeSdkRest} language="typescript" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Authentication */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Authentication
          </h2>
          <Card className="border-border/40">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                All API requests require authentication via a header. The method depends on your integration path:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 text-[10px] mt-0.5">Proxy</Badge>
                  <div>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">api_key = "YOUR_PROXY_TOKEN"</code>
                    <p className="text-xs text-muted-foreground mt-1">Passed as OpenAI API key. Generated on the <strong>Connect</strong> page after linking your provider.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 text-[10px] mt-0.5">REST</Badge>
                  <div>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">x-api-key: YOUR_HFAI_API_KEY</code>
                    <p className="text-xs text-muted-foreground mt-1">Passed as a request header. Found on your organization's <strong>Connect</strong> page.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limits */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Rate Limits
          </h2>
          <Card className="border-border/40">
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-left">
                      <th className="pb-2 font-medium text-foreground">Tier</th>
                      <th className="pb-2 font-medium text-foreground">Events / min</th>
                      <th className="pb-2 font-medium text-foreground">Burst</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-2">Free</td>
                      <td className="py-2">60</td>
                      <td className="py-2">10</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-2">Starter</td>
                      <td className="py-2">300</td>
                      <td className="py-2">50</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-2">Pro</td>
                      <td className="py-2">1,000</td>
                      <td className="py-2">200</td>
                    </tr>
                    <tr>
                      <td className="py-2">Enterprise</td>
                      <td className="py-2">Custom</td>
                      <td className="py-2">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-3">
                Rate-limited responses return <code className="bg-muted px-1 rounded">429 Too Many Requests</code> with a <code className="bg-muted px-1 rounded">Retry-After</code> header.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Codes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" /> Error Codes
          </h2>
          <Card className="border-border/40">
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-left">
                      <th className="pb-2 font-medium text-foreground">Code</th>
                      <th className="pb-2 font-medium text-foreground">Meaning</th>
                      <th className="pb-2 font-medium text-foreground hidden sm:table-cell">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      { code: "200", meaning: "Success", action: "Event ingested & evaluated" },
                      { code: "400", meaning: "Bad Request", action: "Check required fields: event_type, org_id" },
                      { code: "401", meaning: "Unauthorized", action: "Verify your API key or proxy token" },
                      { code: "403", meaning: "Forbidden", action: "Your plan doesn't include this feature" },
                      { code: "429", meaning: "Rate Limited", action: "Back off and retry after Retry-After header" },
                      { code: "500", meaning: "Server Error", action: "Retry with exponential backoff" },
                    ].map((row) => (
                      <tr key={row.code} className="border-b border-border/20 last:border-0">
                        <td className="py-2 font-mono text-xs">{row.code}</td>
                        <td className="py-2">{row.meaning}</td>
                        <td className="py-2 text-xs hidden sm:table-cell">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Setup */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Webhook Notifications
          </h2>
          <Card className="border-border/40">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                HFAI can send real-time webhook notifications when violations are detected. Configure webhooks from the <strong>Notifications</strong> settings page in your dashboard.
              </p>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Payload Format</h4>
                <CodeSnippetBlock code={`// POST to your webhook URL
{
  "event": "violation.created",
  "violation_id": "v-abc123",
  "rule_id": "R-001",
  "severity": "critical",
  "description": "PII Disclosure detected",
  "ai_system_id": "sys-xyz",
  "timestamp": "2025-03-23T10:15:00Z"
}`} language="json" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Supported Events</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> <code className="bg-muted px-1 rounded">violation.created</code> — New violation detected</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> <code className="bg-muted px-1 rounded">violation.reviewed</code> — Human review completed</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> <code className="bg-muted px-1 rounded">rca.completed</code> — Root cause analysis finished</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <h3 className="text-lg font-bold text-foreground">Ready to integrate?</h3>
            <p className="text-sm text-muted-foreground">Sign up free and get your API keys in 2 minutes.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild><Link to="/signup/customer">Get Started Free</Link></Button>
              <Button variant="outline" asChild><Link to="/pilot">Free Pilot Program</Link></Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
