const APPS_SCRIPT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyHPayakkQ1pi_LJSRdett-3oPzn6VGNwvfhNF1HtcTTK_wolkDQrys5JK0HcHmk2U/exec";

async function postToAppsScript(payload) {
  await fetch(APPS_SCRIPT_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });
}

function hasAppsScriptEndpoint() {
  return Boolean(APPS_SCRIPT_ENDPOINT);
}

window.CAMP_BACKEND = {
  APPS_SCRIPT_ENDPOINT,
  postToAppsScript,
  hasAppsScriptEndpoint,
};
