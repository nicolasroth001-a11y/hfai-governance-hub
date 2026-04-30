chrome.runtime.sendMessage({ type: "HFAI_GET_STATUS" }, (status) => {
  if (!status) return;
  const orgEl = document.getElementById("orgid");
  if (orgEl && status.hfaiOrgId) orgEl.textContent = String(status.hfaiOrgId).slice(0, 8) + "…";
  const dash = document.getElementById("dash");
  if (dash && status.hfaiDashboardUrl) dash.href = status.hfaiDashboardUrl;
});
