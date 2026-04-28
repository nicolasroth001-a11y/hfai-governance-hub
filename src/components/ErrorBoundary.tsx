import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const RELOAD_FLAG = "hfai_chunk_reload_at";

// Detects errors that happen when a deploy invalidates JS chunk hashes
// while the user has the old index.html cached.
function isStaleChunkError(error: Error | null): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  const name = (error.name || "").toLowerCase();
  return (
    msg.includes("importing a module script failed") ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("expected a javascript-or-wasm module") ||
    name === "chunkloaderror"
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);

    if (isStaleChunkError(error)) {
      // Avoid reload loops: only auto-reload once per minute.
      try {
        const last = Number(sessionStorage.getItem(RELOAD_FLAG) || "0");
        if (Date.now() - last > 60_000) {
          sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
          // Cache-bust: append a query param so the SW / browser fetches a fresh index.html.
          const url = new URL(window.location.href);
          url.searchParams.set("_v", String(Date.now()));
          window.location.replace(url.toString());
        }
      } catch {
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const stale = isStaleChunkError(this.state.error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {stale ? "Updating to the latest version…" : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground mb-4">
              {stale
                ? "A new version of HFAI was just deployed. Reloading to fetch the latest files."
                : this.state.error?.message}
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("_v", String(Date.now()));
                window.location.replace(url.toString());
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
