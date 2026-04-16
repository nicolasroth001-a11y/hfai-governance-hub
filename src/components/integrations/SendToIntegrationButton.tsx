import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Props {
  violationId?: string;
  message: string;
  eventType?: "new_violation" | "high_severity" | "critical" | "manual_test";
}

export function SendToIntegrationButton({ violationId, message, eventType = "manual_test" }: Props) {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    (supabase as any)
      .from("integrations")
      .select("id, integration_type, display_name, enabled")
      .eq("enabled", true)
      .then(({ data }: any) => setIntegrations(data ?? []));
  }, []);

  const send = async (integrationId?: string) => {
    setSending(integrationId ?? "all");
    try {
      const { data, error } = await supabase.functions.invoke("integration-dispatch", {
        body: { event_type: eventType, violation_id: violationId, message, integration_id: integrationId },
      });
      if (error) throw error;
      toast({ title: "Sent", description: `Dispatched to ${data?.dispatched ?? 0} integration(s).` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message ?? "Dispatch failed", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  if (integrations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send to…
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Active integrations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {integrations.map((i) => (
          <DropdownMenuItem key={i.id} onClick={() => send(i.id)} disabled={!!sending}>
            <span className="capitalize">{i.integration_type}</span>
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">{i.display_name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => send()} disabled={!!sending}>
          Send to all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
