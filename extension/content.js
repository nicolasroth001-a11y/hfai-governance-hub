// Runs on linkedin.com pages. When a lead is queued, it:
// 1. Waits for profile DOM
// 2. Reads headline -> calls AI personalize
// 3. Clicks Connect -> Add a note -> pastes message -> Send
// 4. Reports back

(async function() {
  const { hfaiActive, hfaiCurrentLead } = await chrome.storage.local.get(["hfaiActive", "hfaiCurrentLead"]);
  if (!hfaiActive || !hfaiCurrentLead) return;

  // Only run on profile URLs
  if (!/linkedin\.com\/in\//.test(location.href)) return;

  showOverlay(hfaiCurrentLead);
  await sleep(2500 + Math.random() * 2000);
  await runAutomation(hfaiCurrentLead);
})();

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showOverlay(payload) {
  const old = document.getElementById("hfai-overlay");
  if (old) old.remove();
  const el = document.createElement("div");
  el.id = "hfai-overlay";
  el.innerHTML = `
    <h3>🛡️ HFAI Outreach — Active</h3>
    <div class="lead"><strong>${payload.lead.contact_name || "(no name)"}</strong><br>
      ${payload.lead.contact_title || ""} at ${payload.lead.company_name}</div>
    <div class="step" id="hfai-step">Reading profile…</div>
    <div class="msg" id="hfai-msg">${payload.message}</div>
  `;
  document.body.appendChild(el);
}
function setStep(text, cls = "step") {
  const el = document.getElementById("hfai-step");
  if (el) { el.className = cls; el.textContent = text; }
}
function setMsg(text) {
  const el = document.getElementById("hfai-msg");
  if (el) el.textContent = text;
}

function api(path, body) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: "API", path, body }, resolve);
  });
}

function readHeadline() {
  // LinkedIn profile headline is in .text-body-medium (next to name)
  const candidates = [
    ".text-body-medium.break-words",
    ".pv-text-details__left-panel .text-body-medium",
    "main .text-body-medium",
  ];
  for (const sel of candidates) {
    const el = $(sel);
    if (el && el.innerText.trim().length > 5) return el.innerText.trim();
  }
  return "";
}

async function clickConnectButton() {
  // Primary "Connect" button (sometimes hidden in More menu)
  const directBtn = $$("button").find(b => /^\s*Connect\s*$/i.test(b.innerText) && b.offsetParent !== null);
  if (directBtn) { directBtn.click(); return true; }

  // Try More menu
  const moreBtn = $$("button").find(b => /^\s*More\s*$/i.test(b.innerText) && b.offsetParent !== null);
  if (moreBtn) {
    moreBtn.click();
    await sleep(800 + Math.random() * 600);
    const connectInMenu = $$('[role="button"], button, div').find(el => /^\s*Connect\s*$/i.test(el.innerText) && el.offsetParent !== null);
    if (connectInMenu) { connectInMenu.click(); return true; }
  }
  return false;
}

async function clickAddNote() {
  await sleep(800 + Math.random() * 800);
  const btn = $$("button").find(b => /Add a (note|free note)/i.test(b.innerText) && b.offsetParent !== null);
  if (btn) { btn.click(); return true; }
  return false;
}

async function pasteAndSend(message) {
  await sleep(700 + Math.random() * 600);
  const textarea = $("textarea#custom-message") || $("textarea[name=message]") || $("textarea");
  if (!textarea) return false;
  // Truncate to 290 chars (LinkedIn limit is 300, leave headroom)
  const safe = message.slice(0, 290);
  // Type human-ish
  textarea.focus();
  textarea.value = safe;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(900 + Math.random() * 700);
  const sendBtn = $$("button").find(b => /^\s*Send\s*$/i.test(b.innerText) && !b.disabled && b.offsetParent !== null);
  if (sendBtn) { sendBtn.click(); return true; }
  return false;
}

async function runAutomation(payload) {
  const { lead, template, message: baseMessage } = payload;
  try {
    setStep("Reading headline…");
    const headline = readHeadline();

    setStep("AI personalizing…");
    const ai = await api("personalize", {
      lead_id: lead.id,
      headline,
      template_body: template?.body || baseMessage,
    });
    const finalMessage = ai.message || baseMessage;
    setMsg(finalMessage);

    setStep("Clicking Connect…");
    const connected = await clickConnectButton();
    if (!connected) {
      setStep("Connect button not found (already connected or 1st-degree?). Skipping.", "err");
      await api("update", { lead_id: lead.id, status: "skipped", error: "no_connect_button" });
      finishAndNext();
      return;
    }

    setStep("Adding note…");
    const noteOpened = await clickAddNote();
    if (!noteOpened) {
      setStep("No 'Add note' option (likely premium-required). Skipping.", "err");
      // Cancel modal
      const cancel = $$("button").find(b => /Cancel|Dismiss/i.test(b.innerText) && b.offsetParent !== null);
      if (cancel) cancel.click();
      await api("update", { lead_id: lead.id, status: "skipped", error: "no_add_note" });
      finishAndNext();
      return;
    }

    setStep("Sending…");
    const sent = await pasteAndSend(finalMessage);
    if (!sent) {
      setStep("Send button not clickable.", "err");
      await api("update", { lead_id: lead.id, status: "failed", error: "send_button_disabled" });
      finishAndNext();
      return;
    }

    setStep("✓ Sent!", "ok");
    await api("update", { lead_id: lead.id, status: "sent", message: finalMessage });
    finishAndNext();
  } catch (e) {
    setStep(`Error: ${e.message}`, "err");
    await api("update", { lead_id: lead.id, status: "failed", error: e.message });
    finishAndNext();
  }
}

function finishAndNext() {
  setTimeout(() => {
    chrome.runtime.sendMessage({ type: "DONE_LEAD" });
  }, 3000);
}
