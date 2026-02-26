import { Clock } from "lucide-react";
import { format } from "date-fns";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-1">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="flex flex-col items-center pt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-card-foreground/8 mt-1.5" />
            )}
          </div>
          <div className="pb-5">
            <div className="flex items-center gap-2">
              <span className="text-caption font-medium text-card-foreground capitalize">
                {event.action.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] text-card-foreground/35">by {event.actor}</span>
            </div>
            <p className="text-caption text-card-foreground/50 mt-0.5">{event.details}</p>
            <p className="text-[11px] text-card-foreground/30 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
