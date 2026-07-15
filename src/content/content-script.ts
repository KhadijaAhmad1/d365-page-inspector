import type { D365Context, MessageRequest } from "../lib/types";

const NOT_DETECTED = "Not detected";

function textFromSelectors(selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el) {
        const text = (el.getAttribute("title") || el.textContent || "").trim();
        if (text) return text;
      }
    } catch {
      // invalid selector on this page, skip
    }
  }
  return "";
}

function detectEnvironment(hostname: string): { environment: string; environmentType: string } {
  const parts = hostname.split(".");
  const environment = parts[0] || hostname;

  const lower = hostname.toLowerCase();
  let environmentType = "Unknown";
  if (lower.includes("sandbox") || lower.includes("uat") || lower.includes("test")) {
    environmentType = "Sandbox / Test";
  } else if (lower.includes("dev")) {
    environmentType = "Development";
  } else if (lower.includes("operations.dynamics.com")) {
    environmentType = "Production (likely) — verify before relying on this";
  }
  return { environment, environmentType };
}

function detectLegalEntity(params: URLSearchParams): string {
  const fromUrl = params.get("cmp");
  if (fromUrl) return fromUrl.toUpperCase();

  const fromDom = textFromSelectors([
    "#TopBar_CompanySwitch",
    "[data-dyn-controlname='CompanySwitchButton']",
    "[id*='CompanySwitch']",
    ".companyName",
  ]);
  return fromDom || NOT_DETECTED;
}

function detectFormName(): string {
  const fromDom = textFromSelectors([
    ".formCaption",
    "#formCaption",
    "[data-dyn-controlname='FormCaption']",
    ".breadcrumbBarItemLabel:last-child",
  ]);
  if (fromDom) return fromDom;

  // Fall back to parsing the document title, which D365 F&O usually
  // formats as "Form Caption - Legal Entity - Environment"
  const titleParts = document.title.split(" - ");
  return titleParts[0]?.trim() || NOT_DETECTED;
}

function detectUser(): string {
  const fromDom = textFromSelectors([
    "[id*='UserMenu'] .username",
    "[id*='UserMenu']",
    ".userName",
    "#TopBar_UserMenu_Container",
  ]);
  return fromDom || NOT_DETECTED;
}

function detectMenuItem(params: URLSearchParams): string {
  return params.get("mi") || NOT_DETECTED;
}

function captureContext(): D365Context {
  const url = new URL(window.location.href);
  const { environment, environmentType } = detectEnvironment(url.hostname);

  return {
    environment,
    environmentType,
    legalEntity: detectLegalEntity(url.searchParams),
    user: detectUser(),
    pageTitle: document.title || NOT_DETECTED,
    formName: detectFormName(),
    menuItem: detectMenuItem(url.searchParams),
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
}

chrome.runtime.onMessage.addListener((message: MessageRequest, _sender, sendResponse) => {
  if (message?.type === "CAPTURE_CONTEXT") {
    try {
      sendResponse(captureContext());
    } catch (err) {
      sendResponse({ error: err instanceof Error ? err.message : "Unknown error capturing page context" });
    }
  }
  return true;
});
