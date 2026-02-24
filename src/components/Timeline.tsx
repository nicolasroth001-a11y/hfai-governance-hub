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
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-card-foreground capitalize">
                {event.action.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-card-foreground/40">by {event.actor}</span>
            </div>
            <p className="text-xs text-card-foreground/60 mt-0.5">{event.details}</p>
            <p className="text-xs text-card-foreground/40 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
