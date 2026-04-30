// HFAI Guard — background service worker.
// Handles first-install registration with HFAI cloud and block-event reporting.

const HFAI_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbW5sZ3BxdW5kaGxtcWt1aG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODk1NjQsImV4cCI6MjA4Nzk2NTU2NH0.zCV0U5BmAZPUZQWidM8-HopJgxdxk7CI6rd2AAuW8ko";

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureRegistered() {
  const { hfaiApiKey, hfaiDeviceToken, hfaiOrgId } = await chrome.storage.local.get([
    "hfaiApiKey",
    "hfaiDeviceToken",
    "hfaiOrgId",
  ]);
  if (hfaiApiKey && hfaiOrgId) return { apiKey: hfaiApiKey, orgId: hfaiOrgId };

  const deviceToken = hfaiDeviceToken || randomToken();
  if (!hfaiDeviceToken) await chrome.storage.local.set({ hfaiDeviceToken: deviceToken });

  try {
    const res = await fetch(`${HFAI_BASE}/guard-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        device_token: deviceToken,
        browser: "chrome",
        install_source: "extension",
        user_agent: navigator.userAgent,
      }),
    });
    const data = await res.json();
    if (data.api_key && data.org_id) {
      await chrome.storage.local.set({
        hfaiApiKey: data.api_key,
        hfaiOrgId: data.org_id,
        hfaiDashboardUrl: data.dashboard_url || "https://hfa-i.org/customer/guard",
        hfaiRegisteredAt: Date.now(),
      });
      return { apiKey: data.api_key, orgId: data.org_id };
    }
  } catch (e) {
    console.warn("[HFAI Guard] Registration failed (will retry):", e);
  }
  return null;
}

async function reportBlock(text, matches) {
  const reg = await ensureRegistered();
  if (!reg) return;
  try {
    await fetch(`${HFAI_BASE}/ingest-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        "x-api-key": reg.apiKey,
      },
      body: JSON.stringify({
        event_type: "user_message",
        input_text: String(text || "").slice(0, 4000),
        payload: {
          source: "hfai-guard-extension",
          matches: matches?.slice(0, 5) || [],
          ts: new Date().toISOString(),
        },
      }),
    });
  } catch (e) {
    console.warn("[HFAI Guard] Report failed:", e);
  }
}

chrome.runtime.onInstalled.addListener(() => { ensureRegistered(); });
chrome.runtime.onStartup.addListener(() => { ensureRegistered(); });

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "HFAI_REPORT_BLOCK") {
    reportBlock(msg.text, msg.matches).finally(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "HFAI_GET_STATUS") {
    chrome.storage.local.get(["hfaiOrgId", "hfaiDashboardUrl", "hfaiBlockCount"]).then(sendResponse);
    return true;
  }
});
