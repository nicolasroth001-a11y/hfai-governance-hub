const API_BASE = "https://uomnlgpqundhlmqkuhog.supabase.co/functions/v1/linkedin-extension-api";

async function api(path, body) {
  const { hfaiToken } = await chrome.storage.local.get(["hfaiToken"]);
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Extension-Token": hfaiToken || "" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await res.json();
}

async function getLinkedInTab() {
  // Prefer the active tab if it's on LinkedIn; otherwise any LinkedIn tab.
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (active && /linkedin\.com/.test(active.url || "")) return active;
  const tabs = await chrome.tabs.query({ url: "https://www.linkedin.com/*" });
  return tabs[0] || null;
}

async function processNext() {
  const { hfaiActive } = await chrome.storage.local.get(["hfaiActive"]);
  if (!hfaiActive) {
    console.log("[HFAI bg] Not active, skipping");
    return;
  }

  const next = await api("next");
  console.log("[HFAI bg] Next lead:", next);

  if (next.done) {
    await chrome.storage.local.set({ hfaiActive: false });
    console.log("[HFAI bg] Session complete:", next.reason);
    return;
  }

  const tab = await getLinkedInTab();
  await chrome.storage.local.set({ hfaiCurrentLead: next });

  if (!tab) {
    // No LinkedIn tab open - create one
    await chrome.tabs.create({ url: next.lead.linkedin_url });
    return;
  }

  // Navigate the existing tab to the prospect's profile
  await chrome.tabs.update(tab.id, { url: next.lead.linkedin_url, active: true });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START") {
    processNext();
  } else if (msg.type === "STOP") {
    chrome.alarms.clear("hfai-next");
    chrome.storage.local.set({ hfaiActive: false });
  } else if (msg.type === "DONE_LEAD") {
    (async () => {
      const heartbeat = await api("heartbeat");
      const min = heartbeat.min_delay_seconds || 45;
      const max = heartbeat.max_delay_seconds || 90;
      const delaySec = Math.floor(Math.random() * (max - min + 1)) + min;
      console.log(`[HFAI bg] Next in ${delaySec}s`);
      // chrome.alarms minimum is 0.5 min in production, but accepts smaller in dev
      chrome.alarms.create("hfai-next", { delayInMinutes: Math.max(0.5, delaySec / 60) });
    })();
  } else if (msg.type === "API") {
    api(msg.path, msg.body).then(sendResponse);
    return true;
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "hfai-next") processNext();
});
