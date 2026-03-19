import { useState, useEffect, useCallback } from "react";
import { Shield, Plug, Copy, Check, Eye, EyeOff, Loader2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageView } from "@/hooks/usePageView";

const PROXY_BASE = `https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/openai-proxy`;

export default function CustomerConnect() {
  const { profile } = useAuth();
  usePageView("/customer/connect");

  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadProvider = useCallback(async () => {
    if (!profile?.org_id) return;
    const { data } = await supabase
      .from("connected_providers" as any)
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("provider", "openai")
      .single();
    setProvider(data);
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => { loadProvider(); }, [loadProvider]);

  const handleConnect = async () => {
    if (!apiKey.startsWith("sk-")) {
      toast({ title: "Invalid key", description: "OpenAI API keys start with sk-", variant: "destructive" });
      return;
    }
    if (!profile?.org_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("connected_providers" as any)
        .upsert({
          org_id: profile.org_id,
          provider: "openai",
          api_key_encrypted: apiKey,
          status: "active",
        } as any, { onConflict: "org_id,provider" });

      if (error) throw error;
      toast({ title: "Connected!", description: "OpenAI is now connected. All API calls through the proxy will be monitored." });
      setApiKey("");
      await loadProvider();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!provider?.id) return;
    const { error } = await supabase
      .from("connected_providers" as any)
      .delete()
      .eq("id", provider.id);
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
  const maskedOpenAIKey = provider?.api_key_encrypted
    ? `${provider.api_key_encrypted.slice(0, 7)}...${provider.api_key_encrypted.slice(-4)}`
    : "";

  const pythonSnippet = `import openai

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

  const curlSnippet = `curl ${PROXY_BASE} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${proxyToken}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const nodeSnippet = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${proxyToken}",
  baseURL: "${PROXY_BASE}",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Auto-Connect" description="Connect your OpenAI API key and monitor every AI call automatically — zero code changes." />

      {!provider ? (
        <ContentCard title="Connect OpenAI" icon={<Plug className="h-5 w-5 text-primary" />}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your OpenAI API key below. HFAI will create a proxy endpoint you can use instead of the OpenAI API.
              Every request flows through HFAI and gets automatically monitored against your governance rules.
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
        <div className="space-y-6">
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
          <ContentCard title="Your Proxy Token" icon={<Shield className="h-5 w-5 text-primary" />}>
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

          {/* Integration snippets */}
          <ContentCard title="Integration — 2 minute setup" icon={<ExternalLink className="h-5 w-5 text-primary" />}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Swap your OpenAI base URL and API key. That's it — your existing code works unchanged.
              </p>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Python</span>
                  <CopyButton text={pythonSnippet} label="python" />
                </div>
                <CodeSnippetBlock code={pythonSnippet} language="python" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Node.js / TypeScript</span>
                  <CopyButton text={nodeSnippet} label="node" />
                </div>
                <CodeSnippetBlock code={nodeSnippet} language="typescript" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">cURL</span>
                  <CopyButton text={curlSnippet} label="curl" />
                </div>
                <CodeSnippetBlock code={curlSnippet} language="bash" />
              </div>
            </div>
          </ContentCard>
        </div>
      )}
    </div>
  );
}
