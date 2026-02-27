import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { ReactNode } from "react";

/** Wraps children with a tooltip "Not available in Demo Mode" and disables interaction. */
export function DemoDisabled({ children, className }: { children: ReactNode; className?: string }) {
  const { disabledMessage } = useDemoMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`relative opacity-50 pointer-events-none select-none ${className ?? ""}`}>
          {children}
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/90 rounded-full px-3 py-1">
              <Lock className="h-3 w-3" />
              {disabledMessage}
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{disabledMessage}</TooltipContent>
    </Tooltip>
  );
}
