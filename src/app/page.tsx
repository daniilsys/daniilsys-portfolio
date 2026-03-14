"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const NAME = "daniil";
const BOOT_DURATION = 1400; // boot overlay visible for this long
const HERO_START = 800; // hero animations start while boot is fading
const LETTER_STAGGER = 80;
const NAME_DONE = HERO_START + NAME.length * LETTER_STAGGER;

const BOOT_LINES = [
  { text: "> INIT", delay: 0 },
  { text: "> LOADING MODULES", delay: 150 },
  { text: "> SYS.READY", delay: 400 },
  { text: "> daniil@sys ~", delay: 650 },
];

const projects = [
  {
    name: "sprava",
    descKey: "desc.sprava" as const,
    stack: ["Rust", "Tauri", "React", "Express"],
    link: "https://github.com/daniilsys/sprava",
    archived: true,
  },
  {
    name: "talemy",
    descKey: "desc.talemy" as const,
    stack: ["Express", "Next.js", "Socket.io"],
    link: "https://github.com/daniilsys/talemy-web",
  },
  {
    name: "diself",
    descKey: "desc.diself" as const,
    stack: ["Rust"],
    link: "https://github.com/daniilsys/diself",
  },
  {
    name: "apple-music-rpc",
    descKey: "desc.apple-music-rpc" as const,
    stack: ["Rust"],
    link: "https://github.com/daniilsys/apple-music-rpc",
  },
  {
    name: "cleanapp",
    descKey: "desc.cleanapp" as const,
    stack: ["Rust"],
    link: "https://github.com/daniilsys/cleanapp",
  },
];

export default function Home() {
  const { t, locale, toggle } = useI18n();
  const projectsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBootDone(true), BOOT_DURATION + 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!projectsRef.current) return;
    const rows = projectsRef.current.querySelectorAll("[data-project-row]");

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

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionsRef.current) return;
    const sections =
      sectionsRef.current.querySelectorAll(".section-reveal");

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
      <div
        className="scanline fixed left-0 w-full h-[2px] bg-accent/30 z-[60] pointer-events-none"
        style={{ animationDelay: `${HERO_START - 200}ms`, top: "-2px" }}
        aria-hidden="true"
      />

      <main className="min-h-screen relative">
        <LangToggle locale={locale} toggle={toggle} />

        {/* ── Hero ── */}
        <section className="h-screen flex flex-col justify-center md:justify-end px-6 pb-0 md:pb-16 md:px-16 lg:px-24 relative overflow-hidden">
          {/* Animated grid background */}
          <div
            className="hero-grid absolute inset-0 pointer-events-none"
            style={{ animationDelay: `${HERO_START}ms` }}
            aria-hidden="true"
          />

          <div className="max-w-[1200px] relative z-10">
            {/* Name with glitch effect */}
            <div
              className="glitch-container"
              data-text={NAME}
            >
              <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-light leading-[0.85] tracking-[-0.05em] text-fg">
                {NAME.split("").map((char, i) => (
                  <span key={i} className="hero-letter">
                    <span
                      style={{
                        animationDelay: `${HERO_START + i * LETTER_STAGGER}ms`,
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
              style={{ animationDelay: `${NAME_DONE + 100}ms` }}
            />

            {/* Tagline */}
            <div
              className="hero-fade mt-6 flex items-center gap-3"
              style={{ animationDelay: `${NAME_DONE + 250}ms` }}
            >
              <span className="text-sm md:text-base text-fg-muted tracking-wide uppercase">
                {t("tagline")}
              </span>
              <span className="cursor-blink text-accent text-lg">_</span>
            </div>

            {/* CTAs */}
            <div
              className="hero-fade mt-12 flex flex-wrap items-center gap-4"
              style={{ animationDelay: `${NAME_DONE + 500}ms` }}
            >
              <a
                href="#projects"
                className="inline-block text-xs tracking-[0.2em] uppercase text-fg-muted border border-border px-6 py-3 hover:text-accent hover:border-accent transition-colors duration-150"
              >
                {t("cta")}
              </a>
              <a
                href="#contact"
                className="inline-block text-xs tracking-[0.2em] uppercase text-bg bg-accent px-6 py-3 hover:bg-accent/80 transition-colors duration-150"
              >
                {t("contactMe")}
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hidden md:block absolute bottom-8 left-6 md:left-16 lg:left-24">
            <div
              className="scroll-line w-px h-16 bg-fg-muted/20"
              style={{ animationDelay: `${NAME_DONE + 700}ms` }}
            />
          </div>

          {/* Coordinates */}
          <div
            className="hero-fade absolute top-8 left-6 md:left-16 lg:left-24 text-[10px] tracking-[0.15em] text-fg-muted/30 uppercase"
            style={{ animationDelay: `${NAME_DONE + 400}ms` }}
          >
            47.7508&deg;N 7.3359&deg;E
          </div>
        </section>

        {/* ── About ── */}
        <section className="section-reveal px-6 py-32 md:px-16 lg:px-24">
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

        {/* ── Projects ── */}
        <section
          id="projects"
          className="px-6 py-32 md:px-16 lg:px-24"
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

        {/* ── Contact ── */}
        <section
          id="contact"
          className="section-reveal px-6 py-32 md:px-16 lg:px-24 border-t border-border"
        >
          <div className="max-w-[1200px] grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted">
              {t("contact")}
            </h2>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:daniiliss@proton.me"
                className="text-sm text-fg hover:text-accent transition-colors duration-150"
              >
                daniiliss@proton.me
              </a>
              <a
                href="https://github.com/daniilsys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg/60 hover:text-accent transition-colors duration-150"
              >
                github.com/daniilsys
              </a>
              <p className="text-sm text-fg/60">
                Discord — <span className="text-fg">daniilsys</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 py-8 md:px-16 lg:px-24 border-t border-border">
          <p className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
            daniil &mdash; 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

function LangToggle({
  locale,
  toggle,
}: {
  locale: Locale;
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      className="hero-fade fixed top-8 right-6 md:right-16 lg:right-24 z-40 text-xs tracking-[0.15em] uppercase border border-border px-3 py-1.5 text-fg-muted hover:text-accent hover:border-accent transition-colors duration-150 cursor-pointer"
      style={{ animationDelay: `${NAME_DONE + 400}ms` }}
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
  const inner = (
    <div
      data-project-row
      data-index={index}
      className="group border-b border-border py-6 md:py-8 opacity-0 translate-x-[-12px] transition-none [&.animate-in]:opacity-100 [&.animate-in]:translate-x-0 [&.animate-in]:transition-all [&.animate-in]:duration-400 [&.animate-in]:ease-out"
    >
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 md:gap-8 items-start md:items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-base md:text-lg font-normal tracking-[-0.01em] group-hover:text-accent transition-colors duration-150">
            {project.name}
          </h3>
          {project.archived && (
            <span className="text-[10px] tracking-[0.1em] uppercase text-fg-muted/50 border border-border px-2 py-0.5">
              {t("archived")}
            </span>
          )}
        </div>

        <p className="text-xs md:text-sm text-fg-muted leading-relaxed">
          {t(project.descKey)}
        </p>

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
