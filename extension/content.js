// Runs on linkedin.com pages. When a lead is queued, it:
// 1. Waits for profile DOM
// 2. Reads headline -> calls AI personalize
// 3. Clicks Connect -> Add a note -> pastes message -> Send (skipped in dry run)
// 4. Reports back

(async function() {
  const { hfaiActive, hfaiCurrentLead, hfaiDryRun } = await chrome.storage.local.get(["hfaiActive", "hfaiCurrentLead", "hfaiDryRun"]);
  if (!hfaiActive || !hfaiCurrentLead) {
    console.log("[HFAI] content.js loaded but inactive or no lead", { hfaiActive, hasLead: !!hfaiCurrentLead });
    return;
  }

  // Only run on profile URLs
  if (!/linkedin\.com\/in\//.test(location.href)) {
    console.log("[HFAI] Not on a profile URL, skipping", location.href);
    return;
  }

  const dryRun = hfaiDryRun !== false;
  console.log("[HFAI] Starting automation", { dryRun, lead: hfaiCurrentLead.lead?.contact_name });

  showOverlay(hfaiCurrentLead, dryRun);
  await sleep(2500 + Math.random() * 2000);
  await runAutomation(hfaiCurrentLead, dryRun);
})();

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showOverlay(payload, dryRun) {
  const old = document.getElementById("hfai-overlay");
  if (old) old.remove();
  const el = document.createElement("div");
  el.id = "hfai-overlay";
  el.innerHTML = `
    <h3>🛡️ HFAI Outreach ${dryRun ? '<span style="background:#c4993a;color:#000;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:6px;">DRY RUN</span>' : '<span style="background:#ef4444;color:#fff;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:6px;">LIVE</span>'}</h3>
    <div class="lead"><strong>${payload.lead.contact_name || "(no name)"}</strong><br>
      ${payload.lead.contact_title || ""} at ${payload.lead.company_name}</div>
    <div class="step" id="hfai-step">Reading profile…</div>
    <div class="msg" id="hfai-msg">${payload.message}</div>
    <button id="hfai-cancel" style="margin-top:10px;background:#1a1a1a;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:11px;width:100%;">Stop session</button>
  `;
  document.body.appendChild(el);
  document.getElementById("hfai-cancel").addEventListener("click", async () => {
    await chrome.storage.local.set({ hfaiActive: false });
    chrome.runtime.sendMessage({ type: "STOP" });
    setStep("⏸ Session stopped by user.", "err");
  });
}
function setStep(text, cls = "step") {
  const el = document.getElementById("hfai-step");
  if (el) { el.className = cls; el.textContent = text; }
  console.log("[HFAI]", text);
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
  const directBtn = $$("button").find(b => /^\s*Connect\s*$/i.test(b.innerText) && b.offsetParent !== null);
  if (directBtn) { directBtn.click(); return true; }

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

async function pasteMessage(message) {
  await sleep(700 + Math.random() * 600);
  const textarea = $("textarea#custom-message") || $("textarea[name=message]") || $("textarea");
  if (!textarea) return false;
  const safe = message.slice(0, 290);
  textarea.focus();
  textarea.value = safe;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(900 + Math.random() * 700);
  return true;
}

async function clickSend() {
  const sendBtn = $$("button").find(b => /^\s*Send\s*$/i.test(b.innerText) && !b.disabled && b.offsetParent !== null);
  if (sendBtn) { sendBtn.click(); return true; }
  return false;
}

async function runAutomation(payload, dryRun) {
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
    const finalMessage = (ai && ai.message) ? ai.message : baseMessage;
    setMsg(finalMessage);

    setStep("Clicking Connect…");
    const connected = await clickConnectButton();
    if (!connected) {
      setStep("Connect button not found (already connected, 1st-degree, or LinkedIn UI changed). Skipping.", "err");
      await api("update", { lead_id: lead.id, status: "skipped", error: "no_connect_button" });
      finishAndNext();
      return;
    }

    setStep("Adding note…");
    const noteOpened = await clickAddNote();
    if (!noteOpened) {
      setStep("'Add note' missing (LinkedIn limits free users to 5/month). Skipping.", "err");
      const cancel = $$("button").find(b => /Cancel|Dismiss/i.test(b.innerText) && b.offsetParent !== null);
      if (cancel) cancel.click();
      await api("update", { lead_id: lead.id, status: "skipped", error: "no_add_note" });
      finishAndNext();
      return;
    }

    setStep("Filling message…");
    const filled = await pasteMessage(finalMessage);
    if (!filled) {
      setStep("Message textarea not found.", "err");
      await api("update", { lead_id: lead.id, status: "failed", error: "no_textarea" });
      finishAndNext();
      return;
    }

    if (dryRun) {
      setStep("✓ DRY RUN complete — message ready, NOT sent. Review the modal, then close it. Next lead in 45-90s.", "ok");
      // Mark as 'skipped' with dry-run note so we don't re-process and you can see it worked
      await api("update", { lead_id: lead.id, status: "skipped", error: "dry_run_ok", message: finalMessage });
      finishAndNext();
      return;
    }

    setStep("Sending (LIVE)…");
    const sent = await clickSend();
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
  }, 4000);
}
