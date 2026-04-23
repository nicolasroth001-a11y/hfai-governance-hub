import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeEvent {
  id: string;
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  timestamp: string;
}

interface UseRealtimeOptions {
  tables: string[];
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({ tables, onEvent, enabled = true }: UseRealtimeOptions) {
  const { profile } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const addEvent = useCallback((event: RealtimeEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
    onEvent?.(event);
  }, [onEvent]);

  const orgId = profile?.org_id ?? null;

  useEffect(() => {
    if (!enabled || tables.length === 0 || !orgId) return;

    // Org-scoped channel name required by realtime.messages RLS policy
    const channel = supabase.channel(`org:${orgId}:dashboard`, {
      config: { private: true },
    });

    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table, filter: `org_id=eq.${orgId}` },
        (payload: any) => {
          const event: RealtimeEvent = {
            id: crypto.randomUUID(),
            table: payload.table,
            eventType: payload.eventType,
            new: payload.new ?? {},
            old: payload.old ?? {},
            timestamp: new Date().toISOString(),
          };
          addEvent(event);
        }
      );
    });

    channel.subscribe((status) => {
      setConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setConnected(false);
    };
  }, [tables.join(","), enabled, addEvent, orgId]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { connected, events, clearEvents };
}
