import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePageView(page: string) {
  useEffect(() => {
    supabase.from("page_views").insert({
      page,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent || null,
    }).then(() => {});
  }, [page]);
}
