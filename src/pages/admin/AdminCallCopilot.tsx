import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Sparkles, Trash2, Send, Loader2, Headphones, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// SpeechRecognition is a browser API — minimal types
type SR = any;

interface QAItem {
  id: string;
  transcript: string;
  answer: string;
  ts: number;
  streaming?: boolean;
}

interface CopilotJsonResponse {
  answer?: string;
  error?: string;
  fallback?: boolean;
}

interface MicBanner {
  title: string;
  description: string;
  destructive?: boolean;
}

const COPILOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/call-copilot`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supportsStreamingResponse = () =>
  typeof ReadableStream !== "undefined" && typeof TextDecoder !== "undefined";

export default function AdminCallCopilot() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [items, setItems] = useState<QAItem[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [supported, setSupported] = useState(true);
  const [micBanner, setMicBanner] = useState<MicBanner | null>({
    title: "Microphone prompt",
    description: "When you click Start listening, check near the address bar for the browser mic prompt. If nothing appears, click the lock icon and allow microphone access.",
  });

  const recognitionRef = useRef<SR | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSendTimerRef = useRef<number | null>(null);

  // Build the recognizer lazily inside the click handler so the browser
  // treats start() as part of the user gesture (required by Chrome/Safari).
  const buildRecognizer = useCallback(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
      return null;
    }
    const rec: any = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalChunk += res[0].transcript;
        else interimChunk += res[0].transcript;
      }
      if (finalChunk) {
        setTranscriptBuffer((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk).trim());
        setInterim("");
      } else {
        setInterim(interimChunk);
      }
    };
    rec.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicBanner({
          title: "Microphone blocked",
          description: "Click the lock icon in the address bar, allow microphone access for this site, then reload this page.",
          destructive: true,
        });
        toast({
          title: "Microphone blocked",
          description:
            "Click the lock icon in the address bar → Site settings → Microphone → Allow, then reload.",
          variant: "destructive",
        });
        rec._wantOn = false;
        setListening(false);
      } else if (e.error === "no-speech") {
        // Benign — Chrome fires this after silence; the onend handler restarts.
      } else if (e.error === "audio-capture") {
        setMicBanner({
          title: "No microphone detected",
          description: "Plug in or select a microphone in your computer sound settings, then try again.",
          destructive: true,
        });
        toast({
          title: "No microphone detected",
          description: "Plug in or select a mic in your OS sound settings.",
          variant: "destructive",
        });
        setListening(false);
      }
    };
    rec.onend = () => {
      if (rec._wantOn) {
        try { rec.start(); } catch { /* ignore double-start */ }
      } else {
        setListening(false);
      }
    };
    recognitionRef.current = rec;
    return rec;
  }, []);

  // Detect support once on mount (don't construct yet — that happens on click)
  useEffect(() => {
    const ok = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setSupported(ok);
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        rec._wantOn = false;
        try { rec.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items]);

  useEffect(() => {
    if (!listening || interim || !transcriptBuffer.trim()) return;

    if (autoSendTimerRef.current) {
      window.clearTimeout(autoSendTimerRef.current);
    }

    autoSendTimerRef.current = window.setTimeout(() => {
      setTranscriptBuffer((current) => {
        const next = current.trim();
        if (!next) return current;
        askCopilot(next);
        return "";
      });
      setInterim("");
    }, 1200);

    return () => {
      if (autoSendTimerRef.current) {
        window.clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = null;
      }
    };
  }, [listening, interim, transcriptBuffer]);

  const toggleListening = useCallback(async () => {
    if (listening) {
      const rec = recognitionRef.current;
      if (rec) {
        rec._wantOn = false;
        try { rec.stop(); } catch { /* ignore */ }
      }
      setListening(false);
      return;
    }

    setMicBanner({
      title: "Check the browser prompt",
      description: "The permission popup usually appears beside the address bar at the top of the browser window. If you don’t see it, click the lock icon and allow microphone access.",
    });

    const rec = recognitionRef.current ?? buildRecognizer();
    if (!rec) {
      toast({
        title: "Speech recognition unavailable",
        description: "Use Chrome or Edge on desktop. Safari and mobile have limited support.",
        variant: "destructive",
      });
      return;
    }

    rec._wantOn = true;

    let pendingMicStream: Promise<MediaStream> | null = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        pendingMicStream = navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }
      rec.start();
      setMicBanner({
        title: "Microphone live",
        description: "You’re live. Ask or repeat the question out loud and Copilot will answer automatically after a short pause.",
      });
      setListening(true);
    } catch (e) {
      console.error("recognition.start error:", e);
      const message = e instanceof Error ? e.message : String(e);
      if (!message.toLowerCase().includes("already started")) {
        rec._wantOn = false;
        setMicBanner({
          title: "Microphone failed to start",
          description: "Close other tabs or apps using speech input, then try Start listening again.",
          destructive: true,
        });
        toast({
          title: "Mic start failed",
          description: "Close other speech or dictation apps, then try again.",
          variant: "destructive",
        });
        return;
      }

      setMicBanner({
        title: "Microphone live",
        description: "The mic is already active. Ask or repeat the question out loud and Copilot will answer automatically.",
      });
      setListening(true);
    }

    if (!pendingMicStream) return;

    try {
      const stream = await pendingMicStream;
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      rec._wantOn = false;
      try { rec.stop(); } catch { /* ignore */ }
      setListening(false);

      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setMicBanner({
          title: "Microphone blocked",
          description: "Allow microphone access from the lock icon in the address bar, then reload and try again.",
          destructive: true,
        });
        toast({
          title: "Microphone blocked",
          description:
            "Allow microphone for this site: click the lock icon in the address bar → Site settings → Microphone → Allow, then reload.",
          variant: "destructive",
        });
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setMicBanner({
          title: "No microphone found",
          description: "Connect a microphone or choose one in your computer sound settings.",
          destructive: true,
        });
        toast({
          title: "No microphone found",
          description: "Connect a mic or pick one in your OS sound settings.",
          variant: "destructive",
        });
      } else if (name === "NotReadableError") {
        setMicBanner({
          title: "Microphone already in use",
          description: "Another app is holding the microphone. Close that app or change the input device, then try again.",
          destructive: true,
        });
        toast({
          title: "Microphone in use",
          description: "Another app (Zoom, Meet, etc.) is holding the mic — close it and retry.",
          variant: "destructive",
        });
      } else {
        setMicBanner({
          title: "Microphone error",
          description: err?.message || "Could not access microphone.",
          destructive: true,
        });
        toast({
          title: "Mic error",
          description: err?.message || "Could not access microphone.",
          variant: "destructive",
        });
      }
    }
  }, [listening, buildRecognizer]);

  const askCopilot = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, transcript: trimmed, answer: "", ts: Date.now(), streaming: true }]);

    const history = items.slice(-3).flatMap((it) => [
      { role: "user", content: `Transcript: ${it.transcript}` },
      { role: "assistant", content: it.answer },
    ]);

    try {
      const resp = await fetch(COPILOT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ transcript: trimmed, history, stream: supportsStreamingResponse() }),
      });

      const contentType = resp.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      if (!resp.ok) {
        let payload: CopilotJsonResponse | null = null;
        if (isJson) {
          payload = await resp.json().catch(() => null);
        }

        if (resp.status === 429) {
          toast({ title: "Rate limited", description: "Wait a moment and try again.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI credits exhausted", description: "Top up in Lovable Cloud.", variant: "destructive" });
        } else {
          toast({
            title: payload?.fallback ? "Copilot fallback" : "Copilot error",
            description: payload?.error || `Status ${resp.status}`,
            variant: "destructive",
          });
        }

        setItems((prev) => prev.map((it) => (it.id === id ? {
          ...it,
          answer: payload?.answer || payload?.error || "Copilot failed.",
          streaming: false,
        } : it)));
        return;
      }

      if (isJson || !resp.body || typeof resp.body.getReader !== "function") {
        const payload = await resp.json().catch(() => null) as CopilotJsonResponse | null;
        if (!payload?.answer) {
          toast({
            title: payload?.fallback ? "Copilot fallback" : "Copilot error",
            description: payload?.error || "No answer returned.",
            variant: payload?.fallback ? "default" : "destructive",
          });
        }

        setItems((prev) => prev.map((it) => (it.id === id ? {
          ...it,
          answer: payload?.answer || payload?.error || "No answer returned.",
          streaming: false,
        } : it)));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      let answerSoFar = "";
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              answerSoFar += delta;
              setItems((prev) => prev.map((it) => (it.id === id ? { ...it, answer: answerSoFar } : it)));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, streaming: false } : it)));
    } catch (e) {
      console.error(e);
      toast({ title: "Network error", description: String(e), variant: "destructive" });
      setItems((prev) => prev.map((it) => (it.id === id ? {
        ...it,
        answer: "Copilot couldn’t connect. Use the typed box for a short question and try again.",
        streaming: false,
      } : it)));
    }
  }, [items]);

  const sendBuffered = () => {
    if (!transcriptBuffer.trim()) return;
    const text = transcriptBuffer;
    setTranscriptBuffer("");
    setInterim("");
    askCopilot(text);
  };

  const sendManual = () => {
    if (!manualInput.trim()) return;
    askCopilot(manualInput);
    setManualInput("");
  };

  const clearAll = () => {
    setItems([]);
    setTranscriptBuffer("");
    setInterim("");
  };

  return (
    <div className="space-y-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title="Live Call Copilot"
          description="Listens to the call via your mic, transcribes Scott in real time, and streams HFAI-grounded answers."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={clearAll} className="gap-2">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
          <Button
            onClick={toggleListening}
            disabled={!supported}
            className={`gap-2 ${listening ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Stop listening" : "Start listening"}
          </Button>
        </div>
      </div>

      {!supported && (
        <ContentCard icon={Headphones} title="Browser not supported">
          <p className="text-sm text-muted-foreground">
            Live transcription requires the Web Speech API — use Chrome, Edge, or Safari on desktop.
            You can still type questions manually below.
          </p>
        </ContentCard>
      )}

      {micBanner && (
        <Alert variant={micBanner.destructive ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{micBanner.title}</AlertTitle>
          <AlertDescription>{micBanner.description}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <ContentCard
          icon={Mic}
          title={listening ? "Listening…" : "Mic idle"}
        >
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/30 p-4 min-h-[120px] text-sm">
              {transcriptBuffer && (
                <p className="text-card-foreground whitespace-pre-wrap">{transcriptBuffer}</p>
              )}
              {interim && (
                <p className="text-muted-foreground italic mt-1">{interim}</p>
              )}
              {!transcriptBuffer && !interim && (
                <p className="text-muted-foreground text-xs">
                  {listening
                    ? "Waiting for speech… tip: speak clearly, then click 'Ask copilot' when Scott pauses."
                    : "Click 'Start listening' to begin live transcription."}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendBuffered}
                disabled={!transcriptBuffer.trim()}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" /> Ask copilot
              </Button>
              <Button
                variant="outline"
                onClick={() => { setTranscriptBuffer(""); setInterim(""); }}
                disabled={!transcriptBuffer && !interim}
              >
                Clear buffer
              </Button>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Or type a question manually
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendManual(); }}
                  placeholder="e.g. What's your latency?"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={sendManual} disabled={!manualInput.trim()} variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ContentCard>

        <ContentCard icon={Sparkles} title="Copilot answers">
          <ScrollArea className="h-[520px] pr-4" ref={scrollRef as any}>
            <div className="space-y-4">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Answers stream here. Each card shows what was heard and the suggested response.
                </p>
              )}
              {items.map((it) => (
                <div key={it.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">Heard</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(it.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"{it.transcript}"</p>
                  <div className="border-t border-border pt-2">
                    <Badge className="text-[10px] mb-2 bg-primary/10 text-primary border-primary/20">
                      Suggested answer
                    </Badge>
                    <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
                      {it.answer || (it.streaming && (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" /> thinking…
                        </span>
                      ))}
                      {it.streaming && it.answer && (
                        <span className="inline-block w-1.5 h-3 bg-primary/60 animate-pulse ml-1 align-middle" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </ContentCard>
      </div>

      <ContentCard icon={Headphones} title="How to use during the call">
        <ol className="text-sm text-card-foreground/80 space-y-2 list-decimal list-inside">
          <li>Open this page on a 2nd screen or window beside your call.</li>
          <li>Click <strong>Start listening</strong> — grant mic access. The mic picks up both your voice and Scott's (via your speakers/headset).</li>
          <li>When Scott asks a question and pauses, click <strong>Ask copilot</strong>. A spoken-ready answer streams in 1–3 seconds.</li>
          <li>If transcription misses something, type the question manually in the box.</li>
          <li>Answers are grounded in real HFAI facts — latency, audit trail, pricing, compliance frameworks. They never invent numbers.</li>
        </ol>
      </ContentCard>
    </div>
  );
}
