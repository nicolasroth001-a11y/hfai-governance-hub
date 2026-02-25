import { useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface APIKeyDisplayProps {
  apiKey: string;
  label?: string;
  onRegenerate?: () => void;
}

export function APIKeyDisplay({ apiKey, label = "API Key", onRegenerate }: APIKeyDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [masked, setMasked] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const display = masked ? apiKey.slice(0, 8) + "••••••••••••••••" + apiKey.slice(-4) : apiKey;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-card-foreground/60">{label}</label>
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-3 font-mono text-sm text-foreground">
        <button onClick={() => setMasked(!masked)} className="flex-1 text-left truncate cursor-pointer hover:text-primary transition-colors">
          {display}
        </button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
        {onRegenerate && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
