import { supabase } from "@/integrations/supabase/client";

/**
 * Track conversion funnel events (fire-and-forget).
 * Events: signup_started, signup_completed, onboarding_started,
 * onboarding_step_completed, onboarding_completed, onboarding_skipped
 */
export function trackFunnelEvent(
  eventName: string,
  metadata: Record<string, unknown> = {}
) {
  const sessionId = sessionStorage.getItem("hfai_sid") || crypto.randomUUID();

  supabase.functions
    .invoke("track", {
      body: {
        route: `funnel:${eventName}`,
        session_id: sessionId,
        user_id: null,
        referrer: JSON.stringify(metadata),
        user_agent: navigator.userAgent || null,
      },
    })
    .catch(() => {
      // Analytics should never break the app
    });
}
