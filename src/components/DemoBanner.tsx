import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="w-full bg-muted/60 border-b border-border/40 px-4 py-1.5 flex items-center justify-center gap-2">
      <Info className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-[11px] tracking-wide text-muted-foreground">
        <span className="font-semibold text-primary">Demo Mode</span>
        {" — Data is simulated for demonstration purposes."}
      </span>
    </div>
  );
}
