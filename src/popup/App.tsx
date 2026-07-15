import { useEffect, useMemo, useState } from "react";
import type { D365Context, SavedPage } from "../lib/types";
import {
  addToRecent,
  clearRecent,
  getFavourites,
  getRecent,
  isFavourite,
  removeFavourite,
  toggleFavourite,
} from "../lib/storage";

type Tab = "capture" | "report" | "recent" | "favourites";

const FIELD_LABELS: Record<keyof D365Context, string> = {
  environment: "Environment",
  environmentType: "Environment type",
  legalEntity: "Legal entity",
  user: "User",
  pageTitle: "Page title",
  formName: "Form name",
  menuItem: "Menu item",
  url: "URL",
  timestamp: "Timestamp",
};

const DISPLAY_ORDER: (keyof D365Context)[] = [
  "environment",
  "environmentType",
  "legalEntity",
  "user",
  "formName",
  "menuItem",
  "pageTitle",
  "url",
  "timestamp",
];

function formatContextAsText(context: D365Context): string {
  return DISPLAY_ORDER.map((key) => `${FIELD_LABELS[key]}: ${context[key]}`).join("\n");
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");
  const [context, setContext] = useState<D365Context | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [recent, setRecent] = useState<SavedPage[]>([]);
  const [favourites, setFavourites] = useState<SavedPage[]>([]);

  async function capture() {
    setLoading(true);
    setError(null);
    try {
      const [tabInfo] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabInfo?.id) throw new Error("No active tab found.");
      if (!tabInfo.url || !/dynamics\.com/.test(tabInfo.url)) {
        setError("This does not look like a Dynamics 365 page. Open a D365 environment, then reopen this extension.");
        setLoading(false);
        return;
      }
      const response = await chrome.tabs.sendMessage(tabInfo.id, { type: "CAPTURE_CONTEXT" });
      if (!response || "error" in response) {
        throw new Error(response?.error || "Could not read this page. Try refreshing it and reopening the extension.");
      }
      setContext(response);
      setFavourite(await isFavourite(response));
      await addToRecent(response);
      setRecent(await getRecent());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong capturing this page.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    capture();
    getFavourites().then(setFavourites);
    getRecent().then(setRecent);
  }, []);

  const contextText = useMemo(() => (context ? formatContextAsText(context) : ""), [context]);

  function updateField(key: keyof D365Context, value: string) {
    if (!context) return;
    setContext({ ...context, [key]: value });
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleToggleFavourite() {
    if (!context) return;
    const updated = await toggleFavourite(context);
    setFavourites(updated);
    setFavourite(await isFavourite(context));
  }

  const reportText = useMemo(() => {
    if (!context) return "";
    return [
      "D365 SUPPORT TICKET — CAPTURED CONTEXT",
      "",
      formatContextAsText(context),
      "",
      "ISSUE DESCRIPTION",
      issueDescription.trim() || "(not provided)",
    ].join("\n");
  }, [context, issueDescription]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-dot" />
          <span>D365 Page Inspector</span>
        </div>
        <button className="icon-btn" onClick={capture} title="Re-capture this page" disabled={loading}>
          ⟳
        </button>
      </header>

      <nav className="tabs">
        {(["capture", "report", "recent", "favourites"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>
            {t === "capture" && "Capture"}
            {t === "report" && "Report"}
            {t === "recent" && "Recent"}
            {t === "favourites" && "Favourites"}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === "capture" && (
          <>
            {loading && <p className="muted">Reading page context…</p>}
            {error && <p className="error">{error}</p>}
            {!loading && context && (
              <>
                <div className="fields">
                  {DISPLAY_ORDER.map((key) => (
                    <label key={key} className="field">
                      <span className="field-label">{FIELD_LABELS[key]}</span>
                      <input
                        value={context[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        className="field-input"
                      />
                    </label>
                  ))}
                </div>
                <p className="hint">Detection is best-effort. Correct any field before copying if it is wrong.</p>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => handleCopy(contextText)}>
                    {copied ? "Copied" : "Copy all"}
                  </button>
                  <button className="btn" onClick={() => downloadFile(`d365-context-${Date.now()}.txt`, contextText, "text/plain")}>
                    Export .txt
                  </button>
                  <button className="btn" onClick={handleToggleFavourite}>
                    {favourite ? "★ Favourited" : "☆ Add favourite"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {tab === "report" && context && (
          <>
            <label className="field">
              <span className="field-label">Describe the issue</span>
              <textarea
                className="field-input textarea"
                rows={5}
                placeholder="What were you trying to do, and what happened instead?"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </label>
            <pre className="report-preview">{reportText}</pre>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => handleCopy(reportText)}>
                {copied ? "Copied" : "Copy report"}
              </button>
              <button className="btn" onClick={() => downloadFile(`d365-incident-${Date.now()}.txt`, reportText, "text/plain")}>
                Export report
              </button>
            </div>
          </>
        )}

        {tab === "recent" && (
          <>
            {recent.length === 0 && <p className="muted">No pages captured yet.</p>}
            <ul className="list">
              {recent.map((p) => (
                <li key={p.id} className="list-item">
                  <div className="list-main">
                    <span className="list-title">{p.formName || p.pageTitle}</span>
                    <span className="list-sub">{p.legalEntity} · {p.environment}</span>
                  </div>
                  <button className="icon-btn" onClick={() => handleCopy(formatContextAsText(p))}>⧉</button>
                </li>
              ))}
            </ul>
            {recent.length > 0 && (
              <button className="btn" onClick={async () => { await clearRecent(); setRecent([]); }}>
                Clear recent
              </button>
            )}
          </>
        )}

        {tab === "favourites" && (
          <>
            {favourites.length === 0 && <p className="muted">No favourites yet. Star a page from the Capture tab.</p>}
            <ul className="list">
              {favourites.map((p) => (
                <li key={p.id} className="list-item">
                  <div className="list-main">
                    <span className="list-title">{p.formName || p.pageTitle}</span>
                    <span className="list-sub">{p.legalEntity} · {p.environment}</span>
                  </div>
                  <div className="list-actions">
                    <button className="icon-btn" onClick={() => handleCopy(formatContextAsText(p))}>⧉</button>
                    <button
                      className="icon-btn"
                      onClick={async () => setFavourites(await removeFavourite(p.id))}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
