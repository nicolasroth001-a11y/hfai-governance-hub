import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Plug, Copy, Check, Eye, EyeOff, Loader2, Trash2, ExternalLink, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";

const PROXY_BASE = `https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy`;
const INGEST_BASE = `https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/ingest-event`;

const PROVIDERS = [
  { value: "openai", label: "OpenAI", keyPrefix: "sk-", keyPlaceholder: "sk-...", baseUrl: "https://api.openai.com/v1/chat/completions" },
  { value: "anthropic", label: "Anthropic", keyPrefix: "sk-ant-", keyPlaceholder: "sk-ant-...", baseUrl: "https://api.anthropic.com/v1/messages" },
  { value: "google", label: "Google Gemini", keyPrefix: "AI", keyPlaceholder: "AIza...", baseUrl: "https://generativelanguage.googleapis.com/v1beta" },
] as const;

type ProviderType = typeof PROVIDERS[number]["value"];

export default function CustomerConnect() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  usePageView("/customer/connect");

  const [apiKey, setApiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>("openai");
  const [saving, setSaving] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    try {
      const [providerRes, orgRes] = await Promise.all([
        supabase.from("connected_providers").select("*").eq("org_id", profile.org_id).eq("status", "active"),
        supabase.from("organizations").select("*").eq("id", profile.org_id).single(),
      ]);
      setConnectedProviders(providerRes.data || []);
      setOrg(orgRes.data);
    } catch (err) {
      console.error("CustomerConnect loadData:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConnect = async () => {
    const providerConfig = PROVIDERS.find(p => p.value === selectedProvider);
    if (!providerConfig) return;
    if (!profile?.org_id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("connected_providers")
        .upsert({
          org_id: profile.org_id,
          provider: selectedProvider,
          api_key_encrypted: apiKey,
          base_url: providerConfig.baseUrl,
          status: "active",
        } as any, { onConflict: "org_id,provider" });
      if (error) throw error;
      toast({ title: "Connected!", description: `${providerConfig.label} is now connected via the proxy.` });
      setApiKey("");
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    const { error } = await supabase.from("connected_providers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Disconnected", description: `${name} provider removed.` });
      await loadData();
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

  const orgApiKey = org?.api_key || "hfai_...";
  const activeProvider = connectedProviders[0];
  const proxyToken = activeProvider?.proxy_token || "hfproxy_...";

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

# Works with ANY AI provider — OpenAI, Anthropic, Google, custom models
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
        title={t("customerConnect.title")}
        description={t("customerConnect.description")}
      />

      <Tabs defaultValue="proxy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="proxy" className="gap-2 text-sm">
            <Plug className="h-4 w-4" /> {t("customerConnect.proxyTab")}
          </TabsTrigger>
          <TabsTrigger value="rest" className="gap-2 text-sm">
            <Key className="h-4 w-4" /> {t("customerConnect.restTab")}
          </TabsTrigger>
        </TabsList>

        {/* ── PROXY TAB ── */}
        <TabsContent value="proxy" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Best for: Instant setup with OpenAI, Anthropic, or Google</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Swap your AI provider's base URL to the HFAI proxy. Every API call flows through HFAI and is automatically monitored — <strong>zero code changes</strong> beyond one line. Your AI traffic passes through our proxy, giving HFAI full real-time visibility into inputs and outputs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected providers list */}
          {connectedProviders.length > 0 && (
            <div className="space-y-3">
              {connectedProviders.map((cp) => {
                const config = PROVIDERS.find(p => p.value === cp.provider);
                const masked = cp.api_key_encrypted
                  ? `${cp.api_key_encrypted.slice(0, 7)}...${cp.api_key_encrypted.slice(-4)}`
                  : "";
                return (
                  <Card key={cp.id} className="border-primary/30 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{config?.label || cp.provider} Connected</h3>
                            <p className="text-xs text-muted-foreground">
                              Key: {showKey[cp.id] ? masked : "••••••••••••"}
                              <button onClick={() => setShowKey(prev => ({ ...prev, [cp.id]: !prev[cp.id] }))} className="ml-1 inline-flex items-center text-primary hover:underline">
                                {showKey[cp.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </button>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Token: <code className="font-mono text-[10px]">{cp.proxy_token?.slice(0, 12)}...</code>
                              <CopyButton text={cp.proxy_token} label={`token-${cp.id}`} />
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDisconnect(cp.id, config?.label || cp.provider)}>
                          <Trash2 className="h-3 w-3 mr-1" /> {t("customerConnect.disconnect")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add new provider */}
          <ContentCard title={t("customerConnect.connectProvider")} icon={Plug}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select your AI provider and paste your API key. HFAI creates a proxy endpoint that monitors all requests automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as ProviderType)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="password"
                  placeholder={PROVIDERS.find(p => p.value === selectedProvider)?.keyPlaceholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm flex-1"
                />
                <Button onClick={handleConnect} disabled={saving || !apiKey}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plug className="h-4 w-4 mr-1" />}
                  {t("customerConnect.connect")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your key is stored securely and only used to forward requests to your provider on your behalf.
              </p>
            </div>
          </ContentCard>

          {/* Proxy integration snippets */}
          <ContentCard title="Proxy Integration — 2 minute setup" icon={ExternalLink}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Swap your AI provider's base URL and use your proxy token as the API key. That's it — your existing code works unchanged.
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
