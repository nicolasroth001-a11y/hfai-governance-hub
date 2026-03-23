import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: SUPABASE_KEY },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.valid === false && d.reason === "already_unsubscribed") setStatus("already");
        else if (d.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else if (data.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
    setSubmitting(false);
  };

  const messages: Record<Status, { title: string; desc: string }> = {
    loading: { title: "Validating…", desc: "Please wait while we verify your request." },
    valid: { title: "Unsubscribe", desc: "Click below to stop receiving emails from HFAI." },
    already: { title: "Already unsubscribed", desc: "You've already been unsubscribed from our emails." },
    invalid: { title: "Invalid link", desc: "This unsubscribe link is invalid or has expired." },
    success: { title: "Unsubscribed", desc: "You've been successfully unsubscribed. You won't receive any more emails from us." },
    error: { title: "Something went wrong", desc: "We couldn't process your request. Please try again later." },
  };

  const { title, desc } = messages[status];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight">HFAI</span>
      </Link>
      <Card className="max-w-md w-full rounded-[20px]">
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{desc}</p>
          {status === "valid" && (
            <Button onClick={handleConfirm} disabled={submitting} variant="outline" className="w-full">
              {submitting ? "Processing…" : "Confirm Unsubscribe"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
