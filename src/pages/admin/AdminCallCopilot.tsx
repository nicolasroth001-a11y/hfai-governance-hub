import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ContentCard } from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Sparkles, Trash2, Send, Loader2, Headphones } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// SpeechRecognition is a browser API — minimal types
type SR = any;

interface QAItem {
  id: string;
  transcript: string;
  answer: string;
  ts: number;
  streaming?: boolean;
}

const COPILOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/call-copilot`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function AdminCallCopilot() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [items, setItems] = useState<QAItem[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SR | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
      return;
    }
    const rec: SR = new SpeechRec();
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
        toast({
          title: "Microphone blocked",
          description: "Allow mic access in your browser settings.",
          variant: "destructive",
        });
        setListening(false);
      }
    };
    rec.onend = () => {
      // Auto-restart if still meant to be listening (Chrome stops after silence)
      if (recognitionRef.current?._wantOn) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec._wantOn = false;
      try { rec.stop(); } catch { /* ignore */ }
      setListening(false);
    } else {
      rec._wantOn = true;
      try { rec.start(); setListening(true); } catch (e) { console.error(e); }
    }
  };

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
        body: JSON.stringify({ transcript: trimmed, history }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast({ title: "Rate limited", description: "Wait a moment and try again.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI credits exhausted", description: "Top up in Lovable Cloud.", variant: "destructive" });
        } else {
          toast({ title: "Copilot error", description: `Status ${resp.status}`, variant: "destructive" });
        }
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, answer: "[error]", streaming: false } : it)));
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
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, answer: "[network error]", streaming: false } : it)));
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
