// HFAI Guard popup script.
// Pulls live status from background, surfaces a "Claim dashboard" deep link.
const CLAIM_BASE = "https://hfa-i.org/customer/guard/claim";

chrome.runtime.sendMessage({ type: "HFAI_GET_STATUS" }, (status) => {
  if (!status) return;

  const orgEl = document.getElementById("orgid");
  if (orgEl && status.hfaiOrgId) orgEl.textContent = String(status.hfaiOrgId).slice(0, 8) + "…";

  const blocksEl = document.getElementById("blocks");
  if (blocksEl) blocksEl.textContent = String(status.hfaiBlockCount ?? 0);

  const overridesEl = document.getElementById("overrides");
  if (overridesEl) overridesEl.textContent = String(status.hfaiOverrideCount ?? 0);

  const claim = document.getElementById("claim");
  const dash = document.getElementById("dash");
  if (status.hfaiClaimedAt) {
    if (claim) claim.style.display = "none";
    if (dash) {
      dash.style.display = "block";
      dash.href = status.hfaiDashboardUrl || "https://hfa-i.org/customer/guard";
    }
  } else if (status.hfaiDeviceToken && claim) {
    claim.href = `${CLAIM_BASE}?token=${encodeURIComponent(status.hfaiDeviceToken)}`;
    claim.style.display = "block";
    if (dash) dash.style.display = "none";
  }
});
