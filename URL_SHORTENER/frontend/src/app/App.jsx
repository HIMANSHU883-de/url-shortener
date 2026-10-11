import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";


const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5173"}/api/url`;
const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || "http://localhost:3000";

const SHOW_MARKERS = false;

const serif = "font-['Fraunces',serif]";
const mono = "font-['JetBrains_Mono',ui-monospace,monospace]";

const pretty = (url = "") => url.replace(/^https?:\/\/(www\.)?/, "");
const fullShort = (code) => `${SHORT_BASE}/${code}`;
const displayShort = (code) => pretty(fullShort(code));

function Marker({ n }) {
  if (!SHOW_MARKERS) return null;
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f1117] text-[17px] font-semibold text-white"
    >
      {n}
    </span>
  );
}

function Step({ n, children, className = "" }) {
  return (
    <div className={`flex items-start gap-4 sm:gap-7 ${className}`}>
      <Marker n={n} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ---------- app ---------- */

const App = () => {
  const [urls, setUrls] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentUrl, setCurrentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  async function fetchUrls() {
    try {
      const response = await axios.get(API_URL);
      setUrls(response.data.data);
    } catch {
      setError("Couldn't load your links. Is the server running?");
    }
  }

  async function createShortUrl(e) {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Paste a link first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        url: inputValue,
      });
      setCurrentUrl({
        originalUrl: response.data.data.originalUrl,
        shortCode: response.data.data.shortCode,
      });
      setInputValue("");
      fetchUrls();
    } catch {
      setError("That link couldn't be shortened. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteURL(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUrls();
    } catch {
      setError("That link couldn't be deleted. Try again.");
    }
  }

  async function copyLink(key, code) {
    try {
      await navigator.clipboard.writeText(fullShort(code));
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f1ea] font-['DM_Sans',system-ui,sans-serif] text-[#15171c]">
      {/* top bar */}
      <header className="bg-[#0f1117]">
        <div className="mx-auto flex h-[88px] max-w-5xl items-center px-6 sm:px-10">
          <a
            href="/"
            className={`${serif} text-[32px] font-extrabold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
          >
            URL<span className="text-[#c8542b]">.</span>Shortener
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-10 sm:py-12">
        <div className="rounded-sm border-2 border-dashed border-[#d9d4c4] bg-[#f3f1ea] px-5 py-8 sm:px-12 sm:py-10">
          {/* 1 — heading */}
          <Step n={1}>
            <h1 className={`${serif} text-4xl font-extrabold leading-none tracking-tight sm:text-[44px]`}>
              Long links?
            </h1>
            <p className="mt-2 text-lg text-[#6b6a5f]">
              Paste a link, get a short one, see how many people clicked it.
            </p>
          </Step>

          {/* 2 — input */}
          <Step n={2} className="mt-8">
            <form onSubmit={createShortUrl} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="long-url" className="sr-only">
                Long URL
              </label>
              <input
                id="long-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste a long URL here…"
                aria-invalid={!!error}
                aria-describedby={error ? "url-error" : undefined}
                className={`${mono} h-[76px] min-w-0 flex-1 rounded-lg border border-[#d9d4c4] bg-[#fbfaf6] px-6 text-lg text-[#15171c] placeholder:text-[#8a8878] focus:border-[#0f1117] focus:outline-none focus:ring-2 focus:ring-[#0f1117]/20`}
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[76px] rounded-lg bg-[#0f1117] px-8 text-xl font-medium text-white transition-colors hover:bg-[#262a35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1117] disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Shortening…" : "Shorten"}
              </button>
            </form>
            {error && (
              <p id="url-error" role="alert" className="mt-3 text-base text-[#b3361b]">
                {error}
              </p>
            )}
          </Step>

          {/* 3 — result */}
          {currentUrl && (
            <Step n={3} className="mt-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[#d9d4c4] bg-[#f3f1ea] px-6 py-6 sm:py-7">
                <a
                  href={fullShort(currentUrl.shortCode)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${mono} min-w-0 truncate text-2xl text-[#c0482a] hover:underline`}
                >
                  {displayShort(currentUrl.shortCode)}
                </a>
                <button
                  type="button"
                  onClick={() => copyLink("current", currentUrl.shortCode)}
                  className="shrink-0 rounded-md border border-[#cfc9b8] px-4 py-2 text-lg text-[#55544a] transition-colors hover:bg-[#e9e6db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f1117]"
                >
                  {copied === "current" ? "Copied" : "Copy"}
                </button>
              </div>
            </Step>
          )}

          {/* 4 — list */}
          <Step n={4} className="mt-9">
            <h2 className={`${serif} text-2xl font-semibold`}>Your links ({urls?.length ?? 0})</h2>

            {!urls || urls.length === 0 ? (
              <p className="mt-5 text-lg text-[#6b6a5f]">
                No links yet. Paste one above to create your first short link.
              </p>
            ) : (
              <ul className="mt-4">
                {urls.map((url) => (
                  <li
                    key={url._id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-[#dcd8ca] py-4 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)_auto_auto] sm:gap-x-6"
                  >
                    <a
                      href={fullShort(url.shortCode)}
                      target="_blank"
                      rel="noreferrer"
                      className={`${mono} text-xl text-[#c0482a] hover:underline`}
                    >
                      {url.shortCode}
                    </a>

                    <span
                      title={url.originalUrl}
                      className="order-last col-span-2 truncate text-lg text-[#5e5d52] sm:order-none sm:col-span-1"
                    >
                      {pretty(url.originalUrl)}
                    </span>

                    <span className={`${mono} justify-self-end whitespace-nowrap text-xl text-[#15171c]`}>
                      {url.clicks} {url.clicks === 1 ? "click" : "clicks"}
                    </span>

                    <div className="col-start-2 row-start-1 flex items-center justify-self-end overflow-hidden rounded-md border border-[#cfc9b8] text-lg text-[#55544a] sm:col-start-auto sm:row-start-auto">
                      <button
                        type="button"
                        onClick={() => copyLink(url._id, url.shortCode)}
                        className="px-3 py-2.5 transition-colors hover:bg-[#e9e6db] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0f1117]"
                      >
                        {copied === url._id ? "Copied" : "Copy"}
                      </button>
                      <span aria-hidden="true" className="text-[#9c9887]">
                        ·
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteURL(url._id)}
                        aria-label={`Delete ${url.shortCode}`}
                        className="px-3 py-2.5 transition-colors hover:bg-[#f3dcd4] hover:text-[#b3361b] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0f1117]"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Step>
        </div>
      </main>
    </div>
  );
};

export default App;