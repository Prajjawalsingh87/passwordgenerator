import { useState, useCallback, useEffect, useRef } from "react";

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*-_+=[]{}~`",
};

const OPTIONS = [
  { key: "upper", label: "Uppercase", hint: "A–Z" },
  { key: "lower", label: "Lowercase", hint: "a–z" },
  { key: "numbers", label: "Numbers", hint: "0–9" },
  { key: "symbols", label: "Symbols", hint: "!@#$" },
];

const STRENGTH = [
  { label: "Weak", color: "bg-rose-500", text: "text-rose-700" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-700" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-700" },
  { label: "Strong", color: "bg-indigo-600", text: "text-indigo-700" },
];

// Unbiased random index using the Web Crypto API.
const randomIndex = (max) => {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
};

const getStrength = (length, poolSize) => {
  const bits = length * Math.log2(poolSize || 1);
  if (bits < 50) return 0;
  if (bits < 70) return 1;
  if (bits < 100) return 2;
  return 3;
};

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 01-15.5 6.2L3 16" />
      <path d="M3 12a9 9 0 0115.5-6.2L21 8" />
      <path d="M21 3v5h-5M3 21v-5h5" />
    </svg>
  );
}

function App() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copyError, setCopyError] = useState("");

  const copyTimer = useRef(null);

  const pool = Object.keys(CHARSETS)
    .filter((k) => options[k])
    .map((k) => excludeAmbiguous ? CHARSETS[k].replace(/[Il1O0o]/g, "") : CHARSETS[k])
    .join("");

  const passwordGenerator = useCallback(() => {
    const sets = Object.keys(CHARSETS).filter((k) => options[k]).map((k) => excludeAmbiguous ? CHARSETS[k].replace(/[Il1O0o]/g, "") : CHARSETS[k]);
    if (!sets.length) return;
    const str = sets.join("");

    // Guarantee at least one character from every selected set, then shuffle.
    const chars = sets.map((set) => set[randomIndex(set.length)]);
    while (chars.length < length) chars.push(str[randomIndex(str.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    setPassword(chars.join(""));
    setCopied(false);
  }, [length, options, excludeAmbiguous]);

  const copyPasswordToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setCopyError("");
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError("Clipboard access is blocked. Select the password above and copy it manually.");
    }
  }, [password]);

  useEffect(() => {
    passwordGenerator();
  }, [passwordGenerator]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const toggleOption = (key) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Keep at least one character set enabled.
      return Object.values(next).some(Boolean) ? next : prev;
    });
  };

  const strengthLevel = getStrength(length, pool.length);
  const strength = STRENGTH[strengthLevel];
  const fill = ((length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-20">
      <main className="mx-auto w-full max-w-lg">
        <header className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/15 text-indigo-700 ring-1 ring-emerald-500/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Password Generator</h1>
          <p className="mt-2 text-slate-600">Strong, random passwords — generated right in your browser.</p>
        </header>

        <section className="rounded-2xl border border-surface-border bg-surface-raised/80 p-5 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-7">
          {/* Password output */}
          <div className="rounded-xl border border-surface-border bg-surface-sunken p-4">
            <div className="flex items-start gap-3">
              <p
                className="min-h-[2rem] min-w-0 flex-1 select-all break-all font-mono text-xl leading-8 text-slate-900 sm:text-2xl sm:leading-9"
                aria-live="polite"
                aria-label="Generated password"
              >
                {password}
              </p>
              <button
                type="button"
                onClick={passwordGenerator}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Generate new password"
                title="Generate new password"
              >
                <RefreshIcon />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {STRENGTH.map((s, i) => (
                  <span
                    key={s.label}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= strengthLevel ? strength.color : "bg-surface-border"}`}
                  />
                ))}
              </div>
              <span className={`w-14 text-right text-sm font-semibold ${strength.text}`}>{strength.label}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={copyPasswordToClipboard}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 ${
              copied ? "bg-indigo-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span aria-live="polite">{copied ? "Copied to clipboard" : "Copy password"}</span>
          </button>

          {copyError && <p className="studio-status" role="status">{copyError}</p>}
          <label className="studio-toolbar text-sm text-slate-700">
            <input type="checkbox" checked={excludeAmbiguous} onChange={e => setExcludeAmbiguous(e.target.checked)} />
            Exclude look-alike characters (I, l, 1, O, 0, o)
          </label>
          {/* Length */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="length" className="text-sm font-medium text-slate-700">Length</label>
              <span className="rounded-md bg-surface-sunken px-2.5 py-1 font-mono text-sm font-medium text-slate-900 ring-1 ring-surface-border">
                {length}
              </span>
            </div>
            <input
              id="length"
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={length}
              className="range"
              style={{ "--fill": `${fill}%` }}
              onChange={(e) => setLength(Number(e.target.value))}
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{MIN_LENGTH}</span>
              <span>{MAX_LENGTH}</span>
            </div>
          </div>

          {/* Character sets */}
          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-medium text-slate-700">Include</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {OPTIONS.map((opt) => {
                const checked = options[opt.key];
                return (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-400 ${
                      checked
                        ? "border-emerald-500/50 bg-indigo-600/10"
                        : "border-surface-border bg-surface-sunken hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      onChange={() => toggleOption(opt.key)}
                    />
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        checked ? "border-emerald-500 bg-indigo-600 text-white" : "border-slate-600 text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">{opt.label}</span>
                      <span className="block font-mono text-xs text-slate-600">{opt.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Passwords are generated locally with the Web Crypto API and never leave your device.
        </p>
      </main>
    </div>
  );
}

export default App;
