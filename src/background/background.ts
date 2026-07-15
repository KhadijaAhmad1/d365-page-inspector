chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // eslint-disable-next-line no-console
    console.log("D365 Page Inspector installed.");
  }
});
