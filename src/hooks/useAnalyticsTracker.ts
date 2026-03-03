import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  let sid = sessionStorage.getItem("hfai_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("hfai_sid", sid);
  }
  return sid;
}

export function useAnalyticsTracker() {
  const location = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const route = location.pathname;
    // Avoid duplicate tracking for same route
    if (route === lastTracked.current) return;
    lastTracked.current = route;

    const sessionId = getSessionId();

    // Fire and forget — no await, no blocking
    supabase.functions.invoke("track", {
      body: {
        route,
        session_id: sessionId,
        user_id: null,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      },
    }).catch(() => {
      // Silently fail — analytics should never break the app
    });
  }, [location.pathname]);
}
