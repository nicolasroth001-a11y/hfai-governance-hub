import { useState, useEffect, useCallback } from "react";
import { Shield, Plug, Copy, Check, Eye, EyeOff, Loader2, Trash2, ExternalLink, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";

const PROXY_BASE = `https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy`;
const INGEST_BASE = `https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event`;

export default function CustomerConnect() {
  const { profile } = useAuth();
  usePageView("/customer/connect");

  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!profile?.org_id) return;
    const [providerRes, orgRes] = await Promise.all([
      supabase.from("connected_providers").select("*").eq("org_id", profile.org_id).eq("provider", "openai").single(),
      supabase.from("organizations").select("*").eq("id", profile.org_id).single(),
    ]);
    setProvider(providerRes.data);
    setOrg(orgRes.data);
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConnect = async () => {
    if (!apiKey.startsWith("sk-")) {
      toast({ title: "Invalid key", description: "OpenAI API keys start with sk-", variant: "destructive" });
      return;
    }
    if (!profile?.org_id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("connected_providers")
        .upsert({
          org_id: profile.org_id,
          provider: "openai",
          api_key_encrypted: apiKey,
          status: "active",
        } as any, { onConflict: "org_id,provider" });
      if (error) throw error;
      toast({ title: "Connected!", description: "OpenAI is now connected via the proxy." });
      setApiKey("");
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!provider?.id) return;
    const { error } = await supabase.from("connected_providers").delete().eq("id", provider.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Disconnected", description: "OpenAI provider removed." });
      setProvider(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyToClipboard(text, label)}>
      {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied === label ? "Copied" : "Copy"}
    </Button>
  );

  const proxyToken = provider?.proxy_token || "hfproxy_...";
  const orgApiKey = org?.api_key || "hfai_...";
  const maskedOpenAIKey = provider?.api_key_encrypted
    ? `${provider.api_key_encrypted.slice(0, 7)}...${provider.api_key_encrypted.slice(-4)}`
    : "";

  // Proxy snippets
  const pythonProxy = `import openai

client = openai.OpenAI(
    api_key="${proxyToken}",
    base_url="${PROXY_BASE}",
)

# Use exactly like normal — HFAI monitors automatically
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`;

  const nodeProxy = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${proxyToken}",
  baseURL: "${PROXY_BASE}",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

  const curlProxy = `curl ${PROXY_BASE} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${proxyToken}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  // REST API snippets
  const pythonRest = `import requests

response = requests.post(
    "${INGEST_BASE}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "${orgApiKey}",
    },
    json={
        "event_type": "chat_completion",
        "payload": "User asked about account deletion",
        "metadata": {"model": "claude-3", "provider": "anthropic"}
    }
)
print(response.json())`;

  const nodeRest = `const response = await fetch("${INGEST_BASE}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${orgApiKey}",
  },
  body: JSON.stringify({
    event_type: "chat_completion",
    payload: "User asked about account deletion",
    metadata: { model: "claude-3", provider: "anthropic" },
  }),
});
console.log(await response.json());`;

  const curlRest = `curl ${INGEST_BASE} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${orgApiKey}" \\
  -d '{
    "event_type": "chat_completion",
    "payload": "User asked about account deletion",
    "metadata": {"model": "claude-3", "provider": "anthropic"}
  }'`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Connect & Monitor"
        description="Two ways to monitor your AI — choose the best fit for your setup."
      />

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
          {/* Benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Best for: OpenAI users who want instant setup</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Swap your OpenAI base URL to the HFAI proxy. Every API call flows through HFAI and is automatically monitored — <strong>zero code changes</strong> beyond one line. Your AI traffic passes through our proxy, giving HFAI full visibility into inputs and outputs in real time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!provider ? (
            <ContentCard title="Connect OpenAI" icon={Plug}>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Paste your OpenAI API key below. HFAI will create a proxy endpoint you can use instead of the OpenAI API.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleConnect} disabled={saving || !apiKey}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plug className="h-4 w-4 mr-1" />}
                    Connect
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your key is stored securely and only used to forward requests to OpenAI on your behalf.
                </p>
              </div>
            </ContentCard>
          ) : (
            <>
              {/* Status card */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">OpenAI Connected</h3>
                        <p className="text-xs text-muted-foreground">
                          Key: {showKey ? maskedOpenAIKey : "••••••••••••"}
                          <button onClick={() => setShowKey(!showKey)} className="ml-1 inline-flex items-center text-primary hover:underline">
                            {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDisconnect}>
                      <Trash2 className="h-3 w-3 mr-1" /> Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Proxy token */}
              <ContentCard title="Your Proxy Token" icon={Shield}>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Use this token as your API key. All requests will be monitored by HFAI automatically.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40 font-mono text-sm">
                    <code className="flex-1 break-all text-foreground">{proxyToken}</code>
                    <CopyButton text={proxyToken} label="proxy-token" />
                  </div>
                </div>
              </ContentCard>
            </>
          )}

          {/* Proxy integration snippets */}
          <ContentCard title="Proxy Integration — 2 minute setup" icon={ExternalLink}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Swap your OpenAI base URL and API key. That's it — your existing code works unchanged.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Python</span>
                  <CopyButton text={pythonProxy} label="python-proxy" />
                </div>
                <CodeSnippetBlock code={pythonProxy} language="python" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Node.js / TypeScript</span>
                  <CopyButton text={nodeProxy} label="node-proxy" />
                </div>
                <CodeSnippetBlock code={nodeProxy} language="typescript" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">cURL</span>
                  <CopyButton text={curlProxy} label="curl-proxy" />
                </div>
                <CodeSnippetBlock code={curlProxy} language="bash" />
              </div>
            </div>
          </ContentCard>
        </TabsContent>

        {/* ── REST API TAB ── */}
        <TabsContent value="rest" className="space-y-6">
          {/* Benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Best for: Any AI provider, maximum data control</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Send events directly to the HFAI REST API after your AI responds. Works with <strong>any AI provider</strong> — OpenAI, Anthropic, Google, open-source models, or custom systems. Your AI traffic stays between you and your provider; <strong>only the event metadata</strong> is sent to HFAI for governance monitoring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REST API Key */}
          <ContentCard title="Your REST API Key" icon={Key}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use this key in the <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground">x-api-key</code> header to authenticate event ingestion requests.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40 font-mono text-sm">
                <code className="flex-1 break-all text-foreground">{orgApiKey}</code>
                <CopyButton text={orgApiKey} label="rest-api-key" />
              </div>
            </div>
          </ContentCard>

          {/* REST integration snippets */}
          <ContentCard title="REST API Integration" icon={ExternalLink}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                After your AI generates a response, send the event to HFAI for governance monitoring. Add a few lines after your existing AI call.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Python</span>
                  <CopyButton text={pythonRest} label="python-rest" />
                </div>
                <CodeSnippetBlock code={pythonRest} language="python" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Node.js / TypeScript</span>
                  <CopyButton text={nodeRest} label="node-rest" />
                </div>
                <CodeSnippetBlock code={nodeRest} language="typescript" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">cURL</span>
                  <CopyButton text={curlRest} label="curl-rest" />
                </div>
                <CodeSnippetBlock code={curlRest} language="bash" />
              </div>
            </div>
          </ContentCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
