const API_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/linkedin-extension-api";

const $ = (id) => document.getElementById(id);
const setStatus = (html, cls = "") => { $("status").innerHTML = `<span class="${cls}">${html}</span>`; };

async function loadConfig() {
  const { hfaiToken, hfaiCap, hfaiDryRun } = await chrome.storage.local.get(["hfaiToken", "hfaiCap", "hfaiDryRun"]);
  if (hfaiToken) $("token").value = hfaiToken;
  if (hfaiCap) $("cap").value = hfaiCap;
  // Default dry run = true unless explicitly disabled
  $("dryRun").checked = hfaiDryRun !== false;
}
loadConfig();

$("dryRun").addEventListener("change", async () => {
  await chrome.storage.local.set({ hfaiDryRun: $("dryRun").checked });
});

$("save").addEventListener("click", async () => {
  const token = $("token").value.trim();
  const cap = parseInt($("cap").value || "15", 10);
  if (!token) return setStatus("⚠ Token required.", "danger");
  await chrome.storage.local.set({ hfaiToken: token, hfaiCap: cap, hfaiDryRun: $("dryRun").checked });
  setStatus("Verifying...");
  try {
    const res = await fetch(`${API_BASE}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Extension-Token": token },
    });
    const data = await res.json();
    if (!res.ok) return setStatus(`❌ Failed (${res.status}): ${data.error || "unknown"}`, "danger");
    setStatus(`
      <div class="row"><span>Status</span><span class="ok">✓ Connected</span></div>
      <div class="row"><span>Sent today</span><span>${data.sent_today} / ${data.daily_cap}</span></div>
      <div class="row"><span>Remaining</span><span>${data.remaining}</span></div>
      <div class="row"><span>Delay</span><span>${data.min_delay_seconds}-${data.max_delay_seconds}s</span></div>
      <div class="row"><span>Mode</span><span>${$("dryRun").checked ? "🟡 DRY RUN" : "🔴 LIVE"}</span></div>
    `);
  } catch (e) {
    setStatus(`❌ Network error: ${e.message}<br><br>Check that you saved your token from /admin/leads.`, "danger");
  }
});

$("start").addEventListener("click", async () => {
  const { hfaiToken } = await chrome.storage.local.get(["hfaiToken"]);
  if (!hfaiToken) return setStatus("⚠ Save your token first.", "danger");
  await chrome.storage.local.set({ hfaiActive: true });
  await chrome.runtime.sendMessage({ type: "START" });
  const mode = $("dryRun").checked ? "DRY RUN (no sends)" : "LIVE (will send!)";
  setStatus(`✓ Session started in ${mode}.<br>Switch to your LinkedIn tab — extension will navigate to the next pending lead.`, "ok");
});

$("stop").addEventListener("click", async () => {
  await chrome.storage.local.set({ hfaiActive: false });
  await chrome.runtime.sendMessage({ type: "STOP" });
  setStatus("⏸ Stopped.", "danger");
});
