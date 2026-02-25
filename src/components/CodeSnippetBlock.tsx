import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSnippetBlockProps {
  language: string;
  code: string;
  title?: string;
}

export function CodeSnippetBlock({ language, code, title }: CodeSnippetBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-secondary px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{title || language}</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto bg-background text-sm leading-relaxed">
        <code className="text-foreground font-mono text-xs">{code}</code>
      </pre>
    </div>
  );
}
