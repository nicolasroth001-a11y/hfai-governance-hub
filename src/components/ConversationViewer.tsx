import { cn } from "@/lib/utils";

interface Message {
  role: string;
  content: string;
}

export function ConversationViewer({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl px-4 py-3 text-sm leading-relaxed",
            msg.role === "user" && "bg-secondary text-secondary-foreground ml-8",
            msg.role === "assistant" && "bg-muted text-foreground mr-8",
            msg.role === "system" && "bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium"
          )}
        >
          <span className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-60">
            {msg.role}
          </span>
          {msg.content}
        </div>
      ))}
    </div>
  );
}
