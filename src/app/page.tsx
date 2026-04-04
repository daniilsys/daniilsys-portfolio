"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useGitHubStats, useCrateStats } from "@/lib/stats";
import Link from "next/link";

const NAME = "daniil";
const BOOT_DURATION = 1400; // boot overlay visible for this long
const HERO_START = 800; // hero animations start while boot is fading
const LETTER_STAGGER = 80;
const NAME_DONE = HERO_START + NAME.length * LETTER_STAGGER;

const SCRAMBLE_CHARS = "!@#$%&*_+-=[]{}|;:.<>?";

function scrambleText(el: HTMLElement) {
  const original = el.textContent || "";
  const duration = 600;
  const start = performance.now();

  function update(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const resolved = Math.floor(progress * original.length);

    let result = "";
    for (let i = 0; i < original.length; i++) {
      if (original[i] === " ") {
        result += " ";
      } else if (i < resolved) {
        result += original[i];
      } else {
        result +=
          SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = result;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = original;
  }

  requestAnimationFrame(update);
}

function AnimatedNumber({
  value,
  duration = 800,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          const start = performance.now();
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el!.textContent = String(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}

const BOOT_LINES = [
  { text: "> INIT", delay: 0 },
  { text: "> LOADING MODULES", delay: 150 },
  { text: "> SYS.READY", delay: 400 },
  { text: "> daniil@sys ~", delay: 650 },
];

const projects = [
  {
    name: "gitem",
    descKey: "desc.gitem" as const,
    stack: ["Tauri", "React", "Rust", "FSRS"],
    link: "https://gitem.daniilsys.dev",
    stars: 4,
    featured: true,
    github: "daniilsys/gitem",
  },
  {
    name: "kerak",
    descKey: "desc.kerak" as const,
    stack: ["React Native", "Express", "Prisma", "Mistral AI"],
    link: "/projects/kerak",
    internal: true,
    stars: 4,
    github: "daniilsys/kerak",
  },
  {
    name: "diself",
    descKey: "desc.diself" as const,
    stack: ["Rust"],
    link: "/projects/diself",
    internal: true,
    stars: 3,
    featured: true,
    github: "daniilsys/diself",
    crate: "diself",
  },
  {
    name: "sprava",
    descKey: "desc.sprava" as const,
    stack: ["Rust", "Tauri", "React", "Express"],
    link: "https://sprava.top",
    archived: true,
    stars: 4,
    github: "daniilsys/sprava",
  },
  {
    name: "cleanapp",
    descKey: "desc.cleanapp" as const,
    stack: ["Rust"],
    link: "/projects/cleanapp",
    internal: true,
    stars: 2,
    github: "daniilsys/cleanapp",
  },
];

const freelanceWork = [
  {
    name: "Telegram Auto-Shop Bot",
    descKey: "desc.telegram-bot" as const,
    stack: ["JavaScript", "Telegram", "CryptAPI"],
  },
  {
    name: "PC Optimization Tool",
    descKey: "desc.pc-optim" as const,
    stack: ["Rust", "Tauri", "React"],
  },
];

export default function Home() {
  const { t, locale, toggle } = useI18n();
  const projectsRef = useRef<HTMLDivElement>(null);
  const freelanceRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [skipIntro, setSkipIntro] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const d = (ms: number) => (skipIntro ? 0 : ms);

  useEffect(() => {
    const alreadyBooted = sessionStorage.getItem("bootDone") === "1";
    if (alreadyBooted) {
      setSkipIntro(true);
      setBootDone(true);
    } else {
      const timer = setTimeout(() => {
        setBootDone(true);
        sessionStorage.setItem("bootDone", "1");
      }, BOOT_DURATION + 400);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            if (el.classList.contains("animate-in")) return;
            const delay = Number(el.dataset.index) * 80;
            setTimeout(() => el.classList.add("animate-in"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "50px" },
    );

    [projectsRef, freelanceRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current
        .querySelectorAll("[data-project-row]")
        .forEach((row) => observer.observe(row));
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionsRef.current) return;
    const sections = sectionsRef.current.querySelectorAll(".section-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            // Scramble headings inside this section
            const h2 = (entry.target as HTMLElement).querySelector("h2");
            if (h2 && !h2.dataset.scrambled) {
              h2.dataset.scrambled = "1";
              scrambleText(h2);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Hero cursor glow + 3D parallax
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    const grid = gridRef.current;
    if (!hero || !glow) return;

    let rafId = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = x / rect.width - 0.5;
        const cy = y / rect.height - 0.5;

        glow.style.setProperty("--glow-x", `${x}px`);
        glow.style.setProperty("--glow-y", `${y}px`);

        if (content) {
          content.style.setProperty("--rx", `${cy * -2}deg`);
          content.style.setProperty("--ry", `${cx * 3}deg`);
        }

        if (grid) {
          grid.style.setProperty("--grid-x", `${cx * -15}px`);
          grid.style.setProperty("--grid-y", `${cy * -15}px`);
        }
      });
    };

    const handleEnter = () => glow.classList.add("active");
    const handleLeave = () => {
      glow.classList.remove("active");
      if (content) {
        content.style.setProperty("--rx", "0deg");
        content.style.setProperty("--ry", "0deg");
      }
      if (grid) {
        grid.style.setProperty("--grid-x", "0px");
        grid.style.setProperty("--grid-y", "0px");
      }
    };

    hero.addEventListener("mousemove", handleMove, { passive: true });
    hero.addEventListener("mouseenter", handleEnter);
    hero.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(rafId);
      hero.removeEventListener("mousemove", handleMove);
      hero.removeEventListener("mouseenter", handleEnter);
      hero.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div ref={sectionsRef}>
      {/* ── Film grain ── */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* ── Boot sequence overlay ── */}
      {!bootDone && (
        <div
          className="boot-overlay fixed inset-0 z-[100] bg-bg flex flex-col justify-center px-6 md:px-16 lg:px-24"
          aria-hidden="true"
        >
          <div className="max-w-[600px]">
            {BOOT_LINES.map((line, i) => (
              <p
                key={i}
                className="boot-text text-[10px] md:text-xs tracking-[0.15em] uppercase text-accent/70 mb-2"
                style={{ animationDelay: `${line.delay}ms` }}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Scanline ── */}
      {!skipIntro && (
        <div
          className="scanline fixed left-0 w-full h-[2px] bg-accent/30 z-[60] pointer-events-none"
          style={{ animationDelay: `${HERO_START - 200}ms`, top: "-2px" }}
          aria-hidden="true"
        />
      )}

      <main className="min-h-screen relative">
        <LangToggle locale={locale} toggle={toggle} skipIntro={skipIntro} />

        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="h-screen flex flex-col justify-center md:justify-end px-6 pb-0 md:pb-16 md:px-16 lg:px-24 relative overflow-hidden"
        >
          {/* Cursor glow */}
          <div ref={glowRef} className="hero-glow" aria-hidden="true" />

          {/* Animated grid background (parallax) */}
          <div
            ref={gridRef}
            className="hero-grid absolute inset-0 pointer-events-none"
            style={{ animationDelay: `${d(HERO_START)}ms` }}
            aria-hidden="true"
          />

          {/* Floating particles */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {[
              { top: "20%", left: "10%", dur: "7s", delay: "0s" },
              { top: "60%", left: "85%", dur: "9s", delay: "2s" },
              { top: "45%", left: "50%", dur: "10s", delay: "4s" },
            ].map((p, i) => (
              <div
                key={i}
                className="hero-particle"
                style={
                  {
                    top: p.top,
                    left: p.left,
                    "--dur": p.dur,
                    "--delay": p.delay,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          {/* 3D perspective wrapper */}
          <div className="hero-perspective max-w-[1200px] relative z-10">
            <div ref={contentRef} className="hero-content-3d">
              {/* Name with glitch effect */}
              <div className="glitch-container" data-text={NAME}>
                <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-light leading-[0.85] tracking-[-0.05em] text-fg">
                  {NAME.split("").map((char, i) => (
                    <span key={i} className="hero-letter">
                      <span
                        style={{
                          animationDelay: `${d(HERO_START + i * LETTER_STAGGER)}ms`,
                        }}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </h1>
              </div>

              {/* Accent line with flash */}
              <div
                className="hero-line h-px w-full max-w-[300px] bg-accent/40 mt-6"
                style={{ animationDelay: `${d(NAME_DONE + 100)}ms` }}
              />

              {/* Tagline */}
              <div
                className="hero-fade mt-6 flex items-center gap-3"
                style={{ animationDelay: `${d(NAME_DONE + 250)}ms` }}
              >
                <span className="text-sm md:text-base text-fg-muted tracking-wide uppercase">
                  {t("tagline")}
                </span>
                <span className="cursor-blink text-accent text-lg">_</span>
              </div>

              {/* CTAs */}
              <div
                className="hero-fade mt-12 flex flex-wrap items-center gap-4"
                style={{ animationDelay: `${d(NAME_DONE + 500)}ms` }}
              >
                <a
                  href="#projects"
                  className="inline-block text-xs tracking-[0.2em] uppercase text-fg-muted border border-border px-6 py-3 hover:text-accent hover:border-accent transition-colors duration-150"
                >
                  {t("cta")}
                </a>
                <button
                  onClick={() => setContactOpen(true)}
                  className="cta-glow inline-block text-xs tracking-[0.2em] uppercase text-bg bg-accent px-6 py-3 hover:bg-accent/80 transition-colors duration-150 cursor-pointer"
                >
                  {t("contactMe")}
                </button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:block absolute bottom-8 left-6 md:left-16 lg:left-24">
            <div
              className="scroll-line w-px h-16 bg-fg-muted/20"
              style={{ animationDelay: `${d(NAME_DONE + 700)}ms` }}
            />
          </div>

          {/* Coordinates */}
          <div
            className="hero-fade absolute top-8 left-6 md:left-16 lg:left-24 z-10 text-[10px] tracking-[0.15em] text-fg-muted/30 uppercase"
            style={{ animationDelay: `${d(NAME_DONE + 400)}ms` }}
          >
            47.7508&deg;N 7.3359&deg;E
          </div>
        </section>

        {/* ── About ── */}
        <section className="section-reveal section-divider px-6 py-32 md:px-16 lg:px-24">
          <div className="max-w-[1200px] grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted">
              {t("about")}
            </h2>
            <div className="max-w-[600px]">
              <p className="text-sm md:text-base leading-relaxed text-fg/80">
                {t("aboutText")}
              </p>
              <p className="mt-6 text-xs tracking-[0.15em] uppercase text-accent">
                {t("freelance")}
              </p>
            </div>
          </div>
        </section>

        {/* ── Freelance Work ── */}
        <section
          className="section-reveal px-6 pt-32 pb-16 md:px-16 lg:px-24"
          ref={freelanceRef}
        >
          <div className="max-w-[1200px]">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted block mb-16">
              {t("freelanceWork")}
            </h2>

            <div className="border-t border-border">
              {freelanceWork.map((entry, i) => (
                <div
                  key={entry.name}
                  data-project-row
                  data-index={i}
                  className="group border-b border-border py-6 md:py-8 opacity-0 translate-x-[-12px] transition-none [&.animate-in]:opacity-100 [&.animate-in]:translate-x-0 [&.animate-in]:transition-all [&.animate-in]:duration-400 [&.animate-in]:ease-out"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 md:gap-8 items-start md:items-center">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base md:text-lg font-normal tracking-[-0.01em] group-hover:text-accent transition-colors duration-150">
                        {entry.name}
                      </h3>
                      <span className="text-[10px] tracking-[0.1em] uppercase text-accent/70 border border-accent/30 px-2 py-0.5">
                        {t("client")}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-fg-muted leading-relaxed">
                      {t(entry.descKey)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {entry.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] tracking-[0.1em] uppercase text-fg-muted/70 border border-border/60 px-2 py-1"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section
          id="projects"
          className="px-6 pt-16 pb-32 md:px-16 lg:px-24"
          ref={projectsRef}
        >
          <div className="max-w-[1200px]">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted block mb-16">
              {t("projects")}
            </h2>

            <div className="border-t border-border">
              {projects.map((project, i) => (
                <ProjectRow
                  key={project.name}
                  project={project}
                  index={i}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA before footer ── */}
        <section className="section-reveal px-6 py-24 md:px-16 lg:px-24 border-t border-border flex flex-col items-center text-center gap-6">
          <p className="text-sm text-fg-muted">{t("freelance")}</p>
          <button
            onClick={() => setContactOpen(true)}
            className="text-xs tracking-[0.2em] uppercase text-bg bg-accent px-8 py-4 hover:bg-accent/80 transition-colors duration-150 cursor-pointer"
          >
            {t("contactMe")}
          </button>
          <p className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
            {t("responseTime")}
          </p>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 py-8 md:px-16 lg:px-24 border-t border-border flex items-center justify-between">
          <p className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
            daniil &mdash; 2026
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setContactOpen(true)}
              className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40 hover:text-accent transition-colors duration-150 cursor-pointer"
            >
              {t("contactMe")}
            </button>
            <a
              href="https://github.com/daniilsys/daniilsys-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40 hover:text-accent transition-colors duration-150"
            >
              Source
            </a>
          </div>
        </footer>
      </main>

      {/* ── Contact Modal ── */}
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        t={t}
      />
    </div>
  );
}

const FORMSPREE_ID = "xpqyleee";

const CONTACT_LINKS = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    value: "daniiliss@proton.me",
    href: "mailto:daniiliss@proton.me",
    copy: "daniiliss@proton.me",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    label: "GitHub",
    value: "github.com/daniilsys",
    href: "https://github.com/daniilsys",
    copy: "https://github.com/daniilsys",
  },
];

function ContactModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCopy = useCallback(async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setFormStatus("sent");
        form.reset();
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-bg/90 transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto border border-border bg-bg p-8 md:p-10 transition-all duration-250 ease-out ${closing ? "opacity-0 translate-y-4 scale-[0.97]" : "animate-[fadeSlideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"}`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-fg-muted hover:text-fg transition-colors duration-150 cursor-pointer"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-8">
          {t("contact")}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            required
            placeholder={t("form.name")}
            className="bg-transparent border border-border px-4 py-3 text-sm text-fg placeholder:text-fg-muted/50 focus:border-accent focus:outline-none transition-colors duration-150"
          />
          <input
            type="email"
            name="email"
            required
            placeholder={t("form.email")}
            className="bg-transparent border border-border px-4 py-3 text-sm text-fg placeholder:text-fg-muted/50 focus:border-accent focus:outline-none transition-colors duration-150"
          />
          <textarea
            name="message"
            required
            rows={4}
            placeholder={t("form.message")}
            className="bg-transparent border border-border px-4 py-3 text-sm text-fg placeholder:text-fg-muted/50 focus:border-accent focus:outline-none transition-colors duration-150 resize-none"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={formStatus === "sending" || formStatus === "sent"}
              className="text-xs tracking-[0.2em] uppercase text-bg bg-accent px-6 py-3 hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
            >
              {formStatus === "sending"
                ? t("form.sending")
                : formStatus === "sent"
                  ? t("form.sent")
                  : t("form.send")}
            </button>
            {formStatus === "error" && (
              <span className="text-xs text-red-400">{t("form.error")}</span>
            )}
            <span className="text-[10px] tracking-[0.1em] uppercase text-fg-muted/40 ml-auto">
              {t("responseTime")}
            </span>
          </div>
        </form>

        {/* Divider + direct links */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs tracking-[0.15em] uppercase text-fg-muted/50 mb-5">
            {t("form.or")}
          </p>
          <div className="flex items-center gap-6">
            {CONTACT_LINKS.map((link, i) => (
              <div key={link.label} className="relative group">
                <button
                  onClick={() => {
                    if (link.href) {
                      window.open(link.href, "_blank");
                    }
                    handleCopy(link.copy, i);
                  }}
                  className="text-fg-muted hover:text-accent transition-colors duration-150 cursor-pointer p-2"
                  aria-label={`${link.label}: ${link.value}`}
                >
                  {link.icon}
                </button>

                {/* Hover tooltip — shows value */}
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-surface border border-border text-[10px] tracking-[0.1em] text-fg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                  {link.value}
                </div>

                {/* Copied toast */}
                {copiedIdx === i && (
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-accent text-bg text-[10px] tracking-[0.1em] font-medium whitespace-nowrap animate-[fadeSlideUp_0.2s_ease-out]">
                    {t("form.copied")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LangToggle({
  locale,
  toggle,
  skipIntro,
}: {
  locale: Locale;
  toggle: () => void;
  skipIntro: boolean;
}) {
  return (
    <button
      onClick={toggle}
      className={`${skipIntro ? "" : "hero-fade "}fixed top-8 right-6 md:right-16 lg:right-24 z-40 text-xs tracking-[0.15em] uppercase border border-border px-3 py-1.5 text-fg-muted hover:text-accent hover:border-accent transition-colors duration-150 cursor-pointer`}
      style={skipIntro ? undefined : { animationDelay: `${NAME_DONE + 400}ms` }}
      aria-label="Toggle language"
    >
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}

function ProjectRow({
  project,
  index,
  t,
}: {
  project: (typeof projects)[number];
  index: number;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const gh = useGitHubStats(project.github);
  const crate = useCrateStats(
    "crate" in project ? (project as { crate?: string }).crate : undefined,
  );

  const inner = (
    <div
      data-project-row
      data-index={index}
      className={`group border-b border-border py-6 md:py-8 opacity-0 translate-x-[-12px] transition-none [&.animate-in]:opacity-100 [&.animate-in]:translate-x-0 [&.animate-in]:transition-all [&.animate-in]:duration-400 [&.animate-in]:ease-out ${"featured" in project && project.featured ? "!py-8 md:!py-10" : ""}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 md:gap-8 items-start md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base md:text-lg font-normal tracking-[-0.01em] group-hover:text-accent transition-colors duration-150">
              {project.name}
            </h3>
            {"featured" in project && project.featured && (
              <span className="text-[10px] tracking-[0.1em] uppercase text-bg bg-accent px-2 py-0.5">
                {t("featured")}
              </span>
            )}
            {project.archived && (
              <span className="text-[10px] tracking-[0.1em] uppercase text-fg-muted/50 border border-border px-2 py-0.5">
                {t("archived")}
              </span>
            )}
            <span
              className="flex gap-0.5"
              aria-label={`${project.stars} out of 5`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 16 16"
                  className={`w-3 h-3 ${i < project.stars ? "text-accent" : "text-border"}`}
                >
                  <path
                    fill="currentColor"
                    d="M8 1.3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.5l4-.6z"
                  />
                </svg>
              ))}
            </span>
          </div>
          {/* Live stats */}
          {(gh || crate) && (
            <div className="flex items-center gap-3 mt-2">
              {gh && gh.stars > 0 && (
                <span className="flex items-center gap-1 text-[10px] tracking-[0.1em] text-fg-muted/50">
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path d="M8 1.3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.5l4-.6z" />
                  </svg>
                  <AnimatedNumber value={gh.stars} />
                </span>
              )}
              {crate && (
                <>
                  <span className="flex items-center gap-1 text-[10px] tracking-[0.1em] text-fg-muted/50">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path d="M8 1L1 5v6l7 4 7-4V5L8 1zm0 1.2L13.5 5 8 7.8 2.5 5 8 2.2zM2 5.8l5.5 3v5.4L2 11.2V5.8zm7 8.4V8.8l5-3v5.4l-5 3z" />
                    </svg>
                    <AnimatedNumber value={crate.downloads} duration={1200} />
                  </span>
                  <span className="text-[10px] tracking-[0.1em] text-fg-muted/50">
                    v{crate.version}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs md:text-sm text-fg-muted leading-relaxed">
            {t(project.descKey)}
          </p>
          {project.name === "cleanapp" && (
            <span className="text-[10px] tracking-[0.15em] uppercase text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1.5 inline-block">
              {t("tryDemo")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] tracking-[0.1em] uppercase text-fg-muted/70 border border-border/60 px-2 py-1"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (project.link) {
    if (project.internal) {
      return (
        <Link href={project.link} className="block">
          {inner}
        </Link>
      );
    }
    return (
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    );
  }

  return inner;
}
