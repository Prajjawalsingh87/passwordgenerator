import { useState, useCallback, useEffect, useRef } from "react";
import {
  generatePassword,
  generatePassphrase,
  getCharsets,
  passwordEntropy,
  passphraseEntropy,
  strengthFromBits,
  SEPARATORS,
  WORD_COUNT,
} from "./generator.js";

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;

const MIN_WORDS = 3;
const MAX_WORDS = 10;
const HISTORY_SIZE = 5;
const HISTORY_DELAY = 800;

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

function OptionCard({ checked, onChange, label, hint }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-400 ${
        checked ? "border-emerald-500/50 bg-indigo-600/10" : "border-surface-border bg-surface-sunken hover:border-slate-600"
      }`}
    >
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked ? "border-emerald-500 bg-indigo-600 text-white" : "border-slate-600 text-transparent"
        }`}
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="block font-mono text-xs text-slate-600">{hint}</span>
      </span>
    </label>
  );
}

function RangeField({ id, label, min, max, value, onChange }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        <span className="rounded-md bg-surface-sunken px-2.5 py-1 font-mono text-sm font-medium text-slate-900 ring-1 ring-surface-border">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        className="range"
        style={{ "--fill": `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-2 flex justify-between text-xs text-slate-500" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("password");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [words, setWords] = useState(6);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  // Session-only history: kept in memory, never written to storage.
  const [history, setHistory] = useState([]);
  const [copiedHistory, setCopiedHistory] = useState(-1);

  const copyTimer = useRef(null);
  const isPassphrase = mode === "passphrase";

  const poolSize = getCharsets(options, excludeAmbiguous).join("").length;
  const bits = isPassphrase ? passphraseEntropy(words, addNumber) : passwordEntropy(length, poolSize);

  const generate = useCallback(() => {
    const next = isPassphrase
      ? generatePassphrase({ words, separator, capitalize, addNumber })
      : generatePassword(length, options, excludeAmbiguous);
    if (!next) return;
    setPassword(next);
    setCopied(false);
    setCopiedHistory(-1);
  }, [isPassphrase, words, separator, capitalize, addNumber, length, options, excludeAmbiguous]);

  useEffect(() => {
    generate();
  }, [generate]);

  // Add a result to history once it has settled, so dragging a slider
  // does not flood the list with in-between values.
  useEffect(() => {
    if (!password) return undefined;
    const t = setTimeout(() => {
      setHistory((prev) => [password, ...prev.filter((p) => p !== password)].slice(0, HISTORY_SIZE));
    }, HISTORY_DELAY);
    return () => clearTimeout(t);
  }, [password]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const writeClipboard = async (text, onDone) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError("");
      onDone();
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
        setCopiedHistory(-1);
      }, 1800);
    } catch {
      setCopied(false);
      setCopiedHistory(-1);
      setCopyError("Clipboard access is blocked. Select the text and copy it manually.");
    }
  };

  const copyCurrent = () => writeClipboard(password, () => { setCopied(true); setCopiedHistory(-1); });
  const copyFromHistory = (value, index) => writeClipboard(value, () => { setCopiedHistory(index); setCopied(false); });

  const toggleOption = (key) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Keep at least one character set enabled.
      return Object.values(next).some(Boolean) ? next : prev;
    });
  };

  const strengthLevel = strengthFromBits(bits);
  const strength = STRENGTH[strengthLevel];
  const noun = isPassphrase ? "passphrase" : "password";

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
          {/* Mode */}
          <div className="mb-4 grid grid-cols-2 gap-2" role="group" aria-label="What to generate">
            <button type="button" className="studio-button" aria-pressed={!isPassphrase} onClick={() => setMode("password")}>
              Password
            </button>
            <button type="button" className="studio-button" aria-pressed={isPassphrase} onClick={() => setMode("passphrase")}>
              Passphrase
            </button>
          </div>

          {/* Output */}
          <div className="rounded-xl border border-surface-border bg-surface-sunken p-4">
            <div className="flex items-start gap-3">
              <p
                className="min-h-[2rem] min-w-0 flex-1 select-all break-all font-mono text-xl leading-8 text-slate-900 sm:text-2xl sm:leading-9"
                aria-live="polite"
                aria-label={`Generated ${noun}`}
              >
                {password}
              </p>
              <button
                type="button"
                onClick={generate}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={`Generate new ${noun}`}
                title={`Generate new ${noun}`}
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
            <p className="mt-2 text-xs text-slate-600">
              Entropy: <strong className="font-semibold tabular-nums text-slate-900">{Math.round(bits)} bits</strong>
              <span className="text-slate-500">
                {" · "}
                {isPassphrase
                  ? `${words} words from a list of ${WORD_COUNT}${addNumber ? " + a number" : ""}`
                  : `${length} characters from ${poolSize} options`}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={copyCurrent}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 ${
              copied ? "bg-indigo-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span aria-live="polite">{copied ? "Copied to clipboard" : `Copy ${noun}`}</span>
          </button>

          {copyError && <p className="studio-status" role="status">{copyError}</p>}

          {isPassphrase ? (
            <>
              <RangeField id="words" label="Number of words" min={MIN_WORDS} max={MAX_WORDS} value={words} onChange={setWords} />

              <div className="mt-6">
                <label htmlFor="separator" className="mb-3 block text-sm font-medium text-slate-700">Separator</label>
                <select
                  id="separator"
                  className="studio-input w-full"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                >
                  {SEPARATORS.map((s) => (
                    <option key={s.label} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium text-slate-700">Options</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  <OptionCard checked={capitalize} onChange={() => setCapitalize((v) => !v)} label="Capitalize" hint="Word" />
                  <OptionCard checked={addNumber} onChange={() => setAddNumber((v) => !v)} label="Add a number" hint="word7" />
                </div>
              </fieldset>
            </>
          ) : (
            <>
              <label className="studio-toolbar flex-nowrap text-sm text-slate-700">
                <input type="checkbox" className="shrink-0" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} />
                <span className="min-w-0">Exclude look-alike characters (I, l, 1, O, 0, o)</span>
              </label>

              <RangeField id="length" label="Length" min={MIN_LENGTH} max={MAX_LENGTH} value={length} onChange={setLength} />

              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium text-slate-700">Include</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.key}
                      checked={options[opt.key]}
                      onChange={() => toggleOption(opt.key)}
                      label={opt.label}
                      hint={opt.hint}
                    />
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </section>

        {/* Session history */}
        <section className="mt-6 rounded-2xl border border-surface-border bg-surface-raised/80 p-5 sm:p-7" aria-labelledby="history-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="history-title" className="text-sm font-semibold text-slate-900">Recent (this session)</h2>
            <button
              type="button"
              className="studio-button disabled:opacity-50"
              onClick={() => { setHistory([]); setCopiedHistory(-1); }}
              disabled={!history.length}
            >
              Clear
            </button>
          </div>
          {history.length ? (
            <ol className="mt-4 space-y-2">
              {history.map((item, i) => (
                <li key={item} className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-sunken px-3 py-2">
                  <span className="min-w-0 flex-1 break-all font-mono text-sm text-slate-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => copyFromHistory(item, i)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={copiedHistory === i ? "Copied" : `Copy recent item ${i + 1}`}
                    title="Copy"
                  >
                    {copiedHistory === i ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="studio-note mt-3">Your last {HISTORY_SIZE} results show here. They are cleared when you close the tab.</p>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Passwords are generated locally with the Web Crypto API and never leave your device or get saved.
        </p>
      </main>
    </div>
  );
}

export default App;
