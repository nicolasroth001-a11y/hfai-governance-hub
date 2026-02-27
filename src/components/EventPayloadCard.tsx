import { useState } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Code, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface EventPayloadCardProps {
  data: Record<string, unknown>;
  title?: string;
}

const COLLAPSE_THRESHOLD = 12;

export function EventPayloadCard({ data, title = "Event Payload" }: EventPayloadCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split("\n");
  const isLong = lines.length > COLLAPSE_THRESHOLD;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ShadcnCard className="p-card overflow-hidden">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-card-foreground/6">
        <div className="flex items-center gap-2.5">
          <Code className="h-4 w-4 text-primary/80" />
          <h2 className="text-section text-card-foreground">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-card-foreground/50 hover:text-card-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {isLong ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="rounded-lg bg-background/80 border border-card-foreground/6 overflow-hidden">
            <pre className="p-4 overflow-x-auto scrollbar-thin">
              <code className="text-xs font-mono leading-relaxed">
                {lines.slice(0, COLLAPSE_THRESHOLD).map((line, i) => (
                  <JsonLine key={i} line={line} />
                ))}
                {!open && <span className="text-card-foreground/30">  ...</span>}
              </code>
            </pre>
            <CollapsibleContent>
              <pre className="px-4 pb-4 overflow-x-auto scrollbar-thin">
                <code className="text-xs font-mono leading-relaxed">
                  {lines.slice(COLLAPSE_THRESHOLD).map((line, i) => (
                    <JsonLine key={i + COLLAPSE_THRESHOLD} line={line} />
                  ))}
                </code>
              </pre>
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-card-foreground/40 hover:text-card-foreground/60 transition-colors border-t border-card-foreground/6">
                {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {open ? "Collapse" : `Show all ${lines.length} lines`}
              </button>
            </CollapsibleTrigger>
          </div>
        </Collapsible>
      ) : (
        <div className="rounded-lg bg-background/80 border border-card-foreground/6 overflow-hidden">
          <pre className="p-4 overflow-x-auto scrollbar-thin">
            <code className="text-xs font-mono leading-relaxed">
              {lines.map((line, i) => (
                <JsonLine key={i} line={line} />
              ))}
            </code>
          </pre>
        </div>
      )}
    </ShadcnCard>
  );
}

function JsonLine({ line }: { line: string }) {
  // Simple syntax highlighting
  const highlighted = line
    .replace(/"([^"]+)":/g, '<span class="text-info">\"$1\"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-success/80">\"$1\"</span>')
    .replace(/: (\d+)/g, ': <span class="text-warning">$1</span>')
    .replace(/: (true|false|null)/g, ': <span class="text-destructive/80">$1</span>');

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
