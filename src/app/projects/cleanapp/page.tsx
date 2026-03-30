"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";

/* ═══════════════════════════════════════════
   CASE STUDY TRANSLATIONS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    back: "Back",
    tagline: "Cross-platform CLI tool that finds and removes leftover files from uninstalled apps.",
    problem: "The Problem",
    problemText:
      "When you uninstall an app, you only remove the executable. Hundreds of megabytes of caches, preferences, logs, and support files stay behind — scattered across system directories. On macOS it's ~/Library, on Linux ~/.config and ~/.cache, on Windows %APPDATA%. Over time, these orphaned files pile up, waste disk space, and clutter your system.",
    approach: "The Approach",
    approachText:
      "cleanapp scans platform-specific paths for anything matching the app name you provide. It shows you exactly what it found, with file sizes, and asks for confirmation before deleting anything. No guessing, no silent removals. Works on macOS, Linux, and Windows.",
    choices: "Technical Choices",
    choiceRust: "Rust",
    choiceRustText:
      "Filesystem traversal needs to be fast and safe. Rust gives zero-cost abstractions over OS-level directory walking, with no runtime overhead. The resulting binary is a single native executable — no dependencies to install. Cross-compiles to macOS, Linux, and Windows via CI.",
    choiceSafe: "Safe by default",
    choiceSafeText:
      "Case-insensitive matching catches naming variations (e.g. \"Spotify\" vs \"com.spotify.client\"). Confirmation prompt before any deletion. --exclude flag to protect specific paths. --exact flag for whole-word matching.",
    choiceDeep: "Progressive depth",
    choiceDeepText:
      "Default mode scans platform-specific directories — fast and covers 95% of cases. --deep flag expands to the entire home directory. --here flag limits to the current directory. --max-depth controls how deep the traversal goes.",
    tryIt: "Try it",
    tryItText:
      "This is a simulated terminal. Type commands below to see how cleanapp works.",
    hint: "Try: cleanapp Spotify",
    source: "Source code",
    viewOnGithub: "View on GitHub",
  },
  fr: {
    back: "Retour",
    tagline:
      "Outil CLI cross-platform pour trouver et supprimer les fichiers résiduels d'apps désinstallées.",
    problem: "Le Problème",
    problemText:
      "Quand vous désinstallez une app, vous ne supprimez que l'exécutable. Des centaines de mégaoctets de caches, préférences, logs et fichiers de support restent — éparpillés dans les répertoires système. Sur macOS c'est ~/Library, sur Linux ~/.config et ~/.cache, sur Windows %APPDATA%. Avec le temps, ces fichiers orphelins s'accumulent, gaspillent de l'espace disque et encombrent votre système.",
    approach: "L'Approche",
    approachText:
      "cleanapp scanne les chemins spécifiques à chaque plateforme pour tout ce qui correspond au nom de l'app que vous fournissez. Il vous montre exactement ce qu'il a trouvé, avec les tailles de fichiers, et demande confirmation avant toute suppression. Pas de devinettes, pas de suppressions silencieuses. Fonctionne sur macOS, Linux et Windows.",
    choices: "Choix Techniques",
    choiceRust: "Rust",
    choiceRustText:
      "Le parcours du système de fichiers doit être rapide et sûr. Rust offre des abstractions sans coût sur le parcours de répertoires au niveau OS, sans surcharge à l'exécution. Le binaire résultant est un seul exécutable natif — aucune dépendance à installer. Cross-compilation vers macOS, Linux et Windows via CI.",
    choiceSafe: "Sûr par défaut",
    choiceSafeText:
      "La recherche insensible à la casse capture les variations de noms (ex. \"Spotify\" vs \"com.spotify.client\"). Confirmation requise avant toute suppression. Flag --exclude pour protéger des chemins spécifiques. Flag --exact pour la correspondance de mots entiers.",
    choiceDeep: "Profondeur progressive",
    choiceDeepText:
      "Le mode par défaut scanne les répertoires spécifiques à la plateforme — rapide et couvre 95% des cas. Le flag --deep étend la recherche au répertoire home entier. Le flag --here limite au répertoire courant. --max-depth contrôle la profondeur du parcours.",
    tryIt: "Essayez-le",
    tryItText:
      "Ceci est un terminal simulé. Tapez des commandes ci-dessous pour voir comment cleanapp fonctionne.",
    hint: "Essayez : cleanapp Spotify",
    source: "Code source",
    viewOnGithub: "Voir sur GitHub",
  },
} as const;

type CopyKey = keyof (typeof copy)["en"];

/* ═══════════════════════════════════════════
   SIMULATED FILESYSTEM
   ═══════════════════════════════════════════ */

interface FakeFile {
  path: string;
  sizeBytes: number;
}

const FAKE_APPS: Record<string, FakeFile[]> = {
  spotify: [
    { path: "~/Library/Application Support/Spotify", sizeBytes: 256_901_120 },
    { path: "~/Library/Caches/com.spotify.client", sizeBytes: 935_329_792 },
    {
      path: "~/Library/Preferences/com.spotify.client.plist",
      sizeBytes: 4_096,
    },
    { path: "~/Library/Logs/Spotify", sizeBytes: 12_582_912 },
    {
      path: "~/Library/Saved Application State/com.spotify.client.savedState",
      sizeBytes: 159_744,
    },
  ],
  chrome: [
    {
      path: "~/Library/Application Support/Google/Chrome",
      sizeBytes: 1_288_490_188,
    },
    { path: "~/Library/Caches/Google/Chrome", sizeBytes: 478_150_656 },
    {
      path: "~/Library/Preferences/com.google.Chrome.plist",
      sizeBytes: 8_192,
    },
    {
      path: "~/Library/Google/GoogleSoftwareUpdate",
      sizeBytes: 35_651_584,
    },
    {
      path: "~/Library/Saved Application State/com.google.Chrome.savedState",
      sizeBytes: 245_760,
    },
  ],
  zoom: [
    { path: "~/Library/Application Support/zoom.us", sizeBytes: 70_254_592 },
    { path: "~/Library/Caches/us.zoom.xos", sizeBytes: 128_974_848 },
    { path: "~/Library/Preferences/us.zoom.xos.plist", sizeBytes: 2_048 },
    { path: "~/Library/Logs/zoom.us", sizeBytes: 8_388_608 },
    {
      path: "/Library/Audio/Plug-Ins/HAL/ZoomAudioDevice.driver",
      sizeBytes: 1_258_291,
    },
  ],
  firefox: [
    {
      path: "~/Library/Application Support/Firefox",
      sizeBytes: 412_090_368,
    },
    { path: "~/Library/Caches/Firefox", sizeBytes: 267_386_880 },
    {
      path: "~/Library/Preferences/org.mozilla.firefox.plist",
      sizeBytes: 4_096,
    },
  ],
  slack: [
    {
      path: "~/Library/Application Support/Slack",
      sizeBytes: 534_773_760,
    },
    { path: "~/Library/Caches/com.tinyspeck.slackmacgap", sizeBytes: 189_792_256 },
    {
      path: "~/Library/Preferences/com.tinyspeck.slackmacgap.plist",
      sizeBytes: 4_096,
    },
    { path: "~/Library/Logs/Slack", sizeBytes: 6_291_456 },
    {
      path: "~/Library/Saved Application State/com.tinyspeck.slackmacgap.savedState",
      sizeBytes: 131_072,
    },
  ],
  discord: [
    {
      path: "~/Library/Application Support/discord",
      sizeBytes: 312_475_648,
    },
    { path: "~/Library/Caches/com.hnc.Discord", sizeBytes: 156_237_824 },
    {
      path: "~/Library/Preferences/com.hnc.Discord.plist",
      sizeBytes: 4_096,
    },
  ],
  vscode: [
    { path: "~/Library/Application Support/Code", sizeBytes: 845_152_256 },
    {
      path: "~/Library/Caches/com.microsoft.VSCode",
      sizeBytes: 234_881_024,
    },
    {
      path: "~/Library/Preferences/com.microsoft.VSCode.plist",
      sizeBytes: 8_192,
    },
    {
      path: "~/Library/Saved Application State/com.microsoft.VSCode.savedState",
      sizeBytes: 262_144,
    },
  ],
};

const DEEP_EXTRAS: Record<string, FakeFile[]> = {
  spotify: [
    {
      path: "~/Library/LaunchAgents/com.spotify.webhelper.plist",
      sizeBytes: 1_024,
    },
    { path: "~/.spotify-connect", sizeBytes: 24_576 },
  ],
  chrome: [
    {
      path: "~/Library/LaunchAgents/com.google.keystone.agent.plist",
      sizeBytes: 2_048,
    },
    { path: "~/.config/google-chrome", sizeBytes: 4_096 },
  ],
  zoom: [
    {
      path: "~/Library/LaunchAgents/us.zoom.ZoomDaemon.plist",
      sizeBytes: 1_536,
    },
  ],
  discord: [
    { path: "~/.config/discord", sizeBytes: 8_192 },
  ],
  vscode: [
    { path: "~/.vscode", sizeBytes: 167_772_160 },
  ],
};

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + " MB";
  if (bytes >= 1_024) return (bytes / 1_024).toFixed(1) + " KB";
  return bytes + " B";
}

/* ═══════════════════════════════════════════
   TERMINAL TYPES
   ═══════════════════════════════════════════ */

type LineType = "input" | "output" | "info" | "error" | "success" | "file";

interface TermLine {
  text: string;
  type: LineType;
}

/* ═══════════════════════════════════════════
   TERMINAL COMPONENT
   ═══════════════════════════════════════════ */

function Terminal() {
  const [lines, setLines] = useState<TermLine[]>([
    { text: "cleanapp v0.2.0 — type 'cleanapp --help' for usage", type: "info" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState<FakeFile[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(scrollToBottom, [lines, scrollToBottom]);

  const addLines = useCallback((...newLines: TermLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runScan = useCallback(
    async (appName: string, deep: boolean, excludes: string[], exact: boolean, caseSensitive: boolean) => {
      setBusy(true);

      const key = caseSensitive ? appName : appName.toLowerCase();
      let files = FAKE_APPS[key] ? [...FAKE_APPS[key]] : [];

      if (deep && DEEP_EXTRAS[key]) {
        files = [...files, ...DEEP_EXTRAS[key]];
      }

      if (exact) {
        files = files.filter((f) => {
          const parts = f.path.split("/");
          const last = parts[parts.length - 1].toLowerCase();
          return last === key || last.startsWith(key + ".") || last.includes("." + key);
        });
      }

      if (excludes.length > 0) {
        files = files.filter(
          (f) => !excludes.some((ex) => f.path.toLowerCase().includes(ex.toLowerCase()))
        );
      }

      addLines({ text: `$ cleanapp ${appName}${deep ? " --deep" : ""}${excludes.map((e) => ` --exclude ${e}`).join("")}${exact ? " --exact" : ""}${caseSensitive ? " --case-sensitive" : ""}`, type: "input" });

      await sleep(300);
      addLines({ text: "Scanning ~/Library/ ...", type: "info" });
      await sleep(600);
      addLines({ text: "Scanning /Library/ ...", type: "info" });

      if (deep) {
        await sleep(500);
        addLines({ text: "Scanning ~/ (deep mode) ...", type: "info" });
        await sleep(800);
      } else {
        await sleep(400);
      }

      if (files.length === 0) {
        addLines(
          { text: "", type: "output" },
          { text: `No leftover files found for "${appName}".`, type: "info" },
        );
        setBusy(false);
        return;
      }

      addLines({ text: "", type: "output" });

      const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

      for (const f of files) {
        addLines({
          text: `  ${f.path}  (${formatSize(f.sizeBytes)})`,
          type: "file",
        });
        await sleep(80);
      }

      addLines(
        { text: "", type: "output" },
        {
          text: `Found ${files.length} item${files.length > 1 ? "s" : ""} (${formatSize(totalBytes)} total)`,
          type: "info",
        },
        { text: "Remove these files? [y/N] ", type: "output" },
      );

      setAwaitConfirm(files);
      setBusy(false);
    },
    [addLines],
  );

  const handleConfirm = useCallback(
    async (answer: string) => {
      const files = awaitConfirm;
      setAwaitConfirm(null);

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        setBusy(true);
        addLines({ text: answer, type: "input" });
        await sleep(400);
        const totalBytes = files!.reduce((sum, f) => sum + f.sizeBytes, 0);
        addLines({
          text: `Removed ${files!.length} item${files!.length > 1 ? "s" : ""}, freed ${formatSize(totalBytes)}.`,
          type: "success",
        });
        setBusy(false);
      } else {
        addLines(
          { text: answer || "n", type: "input" },
          { text: "Aborted.", type: "info" },
        );
      }
    },
    [awaitConfirm, addLines],
  );

  const parseCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      if (trimmed === "clear") {
        setLines([]);
        return;
      }

      if (trimmed === "help" || trimmed === "cleanapp --help" || trimmed === "cleanapp -h") {
        addLines(
          { text: `$ ${trimmed}`, type: "input" },
          { text: "", type: "output" },
          { text: "USAGE:", type: "info" },
          { text: "  cleanapp <APP_NAME> [OPTIONS]", type: "output" },
          { text: "", type: "output" },
          { text: "OPTIONS:", type: "info" },
          { text: "  --deep             Scan entire home directory", type: "output" },
          { text: "  --exclude <NAME>   Exclude paths containing NAME", type: "output" },
          { text: "  --exact            Match app name as complete word", type: "output" },
          { text: "  --case-sensitive   Enforce exact casing", type: "output" },
          { text: "  --here             Search only in current directory", type: "output" },
          { text: "  --max-depth <N>    Maximum search depth", type: "output" },
          { text: "  --add <PATH>       Add custom search path", type: "output" },
          { text: "", type: "output" },
          { text: "EXAMPLES:", type: "info" },
          { text: "  cleanapp Spotify", type: "output" },
          { text: "  cleanapp Chrome --exclude Arc", type: "output" },
          { text: "  cleanapp Firefox --deep", type: "output" },
          { text: "  cleanapp Zoom --exact", type: "output" },
          { text: "  cleanapp node_modules --here", type: "output" },
        );
        return;
      }

      if (!trimmed.startsWith("cleanapp ") && trimmed !== "cleanapp") {
        addLines(
          { text: `$ ${trimmed}`, type: "input" },
          { text: `zsh: command not found: ${trimmed.split(" ")[0]}`, type: "error" },
        );
        return;
      }

      if (trimmed === "cleanapp") {
        addLines(
          { text: "$ cleanapp", type: "input" },
          { text: "Error: missing app name. Usage: cleanapp <APP_NAME> [OPTIONS]", type: "error" },
        );
        return;
      }

      // Parse args
      const parts = trimmed.replace("cleanapp ", "").split(/\s+/);
      let appName = "";
      let deep = false;
      let exact = false;
      let caseSensitive = false;
      const excludes: string[] = [];

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p === "--deep") { deep = true; }
        else if (p === "--exact") { exact = true; }
        else if (p === "--case-sensitive") { caseSensitive = true; }
        else if (p === "--exclude" && i + 1 < parts.length) {
          excludes.push(parts[++i]);
        } else if (!p.startsWith("--")) {
          if (!appName) appName = p;
        }
      }

      if (!appName) {
        addLines(
          { text: `$ ${trimmed}`, type: "input" },
          { text: "Error: missing app name.", type: "error" },
        );
        return;
      }

      runScan(appName, deep, excludes, exact, caseSensitive);
    },
    [addLines, runScan],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (busy) return;
      const val = input;
      setInput("");

      if (awaitConfirm) {
        handleConfirm(val);
      } else {
        parseCommand(val);
      }
    },
    [input, busy, awaitConfirm, handleConfirm, parseCommand],
  );

  return (
    <div className="border border-border bg-[#080808] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f0f] border-b border-border">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
          Terminal — cleanapp
        </span>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        className="p-4 h-[380px] overflow-y-auto text-sm leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "text-accent"
                : line.type === "error"
                  ? "text-red-400"
                  : line.type === "success"
                    ? "text-accent font-medium"
                    : line.type === "info"
                      ? "text-fg-muted"
                      : line.type === "file"
                        ? "text-fg/70"
                        : "text-fg/50"
            }
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="text-accent shrink-0">
            {awaitConfirm ? "[y/N]" : "~ $"}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            className="flex-1 bg-transparent text-fg outline-none caret-accent disabled:opacity-30"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function CleanappCaseStudy() {
  const { locale, toggle } = useI18n();
  const t = (key: CopyKey) => copy[locale][key];
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "";
  }, []);

  useEffect(() => {
    if (!sectionsRef.current) return;
    const sections = sectionsRef.current.querySelectorAll(".section-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionsRef}>
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 lg:px-24 py-6 flex items-center justify-between">
        <Link
          href="/#projects"
          className="text-xs tracking-[0.2em] uppercase text-fg-muted hover:text-accent transition-colors duration-150 flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("back")}
        </Link>
        <button
          onClick={toggle}
          className="text-xs tracking-[0.15em] uppercase border border-border px-3 py-1.5 text-fg-muted hover:text-accent hover:border-accent transition-colors duration-150 cursor-pointer"
        >
          {locale === "en" ? "FR" : "EN"}
        </button>
      </nav>

      <main className="min-h-screen pt-32 pb-24 px-6 md:px-16 lg:px-24">
        {/* ── Hero ── */}
        <div className="max-w-[1100px] mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] tracking-[0.15em] uppercase text-accent border border-accent/30 px-2 py-1">
              Rust
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
              CLI Tool — macOS · Linux · Windows
            </span>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-light leading-[0.9] tracking-[-0.04em] text-fg mb-6">
            cleanapp
          </h1>
          <p className="text-base md:text-lg text-fg-muted leading-relaxed max-w-[600px]">
            {t("tagline")}
          </p>
        </div>

        {/* ── Two-column: sticky terminal + scrolling content ── */}
        <div className="max-w-[1100px] flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ── Sticky terminal (left) ── */}
          <div className="lg:w-[420px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-3">
                {t("tryIt")}
              </h2>
              <p className="text-sm text-fg-muted/60 mb-4">
                {t("tryItText")}
              </p>
              <Terminal />
              <p className="text-xs text-fg-muted/30 mt-3 tracking-wide">
                {t("hint")}
              </p>
            </div>
          </div>

          {/* ── Scrolling content (right) ── */}
          <div className="flex-1 min-w-0">
            {/* ── Problem ── */}
            <section className="section-reveal mb-20">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-6">
                {t("problem")}
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-fg/80">
                {t("problemText")}
              </p>
            </section>

            {/* ── Approach ── */}
            <section className="section-reveal mb-20">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-6">
                {t("approach")}
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-fg/80">
                {t("approachText")}
              </p>
            </section>

            {/* ── Technical Choices ── */}
            <section className="section-reveal mb-20">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-8">
                {t("choices")}
              </h2>
              <div className="grid gap-8">
                {(["Rust", "Safe", "Deep"] as const).map((key) => (
                  <div key={key} className="border-l-2 border-accent/20 pl-6">
                    <h3 className="text-sm font-medium text-fg mb-2">
                      {t(`choice${key}` as CopyKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-fg-muted">
                      {t(`choice${key}Text` as CopyKey)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Source ── */}
            <section className="section-reveal pt-10 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.2em] uppercase text-fg-muted">
                  {t("source")}
                </span>
                <a
                  href="https://github.com/daniilsys/cleanapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-fg-muted border border-border px-4 py-2 hover:text-accent hover:border-accent transition-colors duration-150 flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  {t("viewOnGithub")}
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
