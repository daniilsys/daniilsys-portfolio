"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useGitHubStats, useCrateStats } from "@/lib/stats";
import Link from "next/link";

/* ═══════════════════════════════════════════
   CASE STUDY TRANSLATIONS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    back: "Back",
    tagline:
      "Async Rust library for Discord selfbot automation. Type-safe, event-driven, built on tokio.",
    problem: "The Problem",
    problemText:
      "Automating Discord user accounts in Rust meant dealing with raw WebSocket connections, manually parsing gateway events, handling reconnection logic, and managing rate limits — all from scratch. Existing solutions were either outdated, incomplete, or tied to bot-only APIs that don't work with user tokens.",
    approach: "The Approach",
    approachText:
      "diself provides a clean, strongly-typed async API that abstracts away the complexity of Discord's gateway and REST protocols. You implement an EventHandler trait, and the library handles the connection lifecycle — heartbeats, session resumption, exponential backoff, and caching — so you can focus on what your automation actually does.",
    choices: "Technical Choices",
    choiceAsync: "Async-first on tokio",
    choiceAsyncText:
      "Discord bots need to handle many concurrent events — messages, presence updates, guild changes — without blocking. Tokio's async runtime lets diself process all of this efficiently on a single thread, with zero-cost futures and cooperative scheduling.",
    choiceTypes: "Exhaustive type system",
    choiceTypesText:
      "60+ gateway events are modeled as typed Rust enums. Every channel, message, guild, role, and permission has a dedicated struct. If your handler compiles, it handles the data correctly — no runtime surprises from untyped JSON.",
    choiceResilience: "Built-in resilience",
    choiceResilienceText:
      "Network drops happen. diself automatically reconnects, resumes sessions when possible, and backs off exponentially when the gateway pushes back. Rate limits on the REST API are tracked and retried transparently.",
    features: "Key Features",
    feat1: "60+ gateway events with typed handlers",
    feat2: "Automatic reconnection & session resumption",
    feat3: "Configurable caching (users, channels, guilds)",
    feat4: "Builder patterns for messages & embeds",
    feat5: "Rate-limit aware HTTP client",
    feat6: "Graceful shutdown via Client::shutdown()",
    usage: "Usage Example",
    source: "Source & Crate",
    viewOnGithub: "GitHub",
    viewOnCrates: "crates.io",
  },
  fr: {
    back: "Retour",
    tagline:
      "Bibliothèque Rust asynchrone pour l'automatisation de selfbots Discord. Type-safe, event-driven, construite sur tokio.",
    problem: "Le Problème",
    problemText:
      "Automatiser des comptes Discord utilisateur en Rust impliquait de gérer des connexions WebSocket brutes, parser manuellement les événements gateway, implémenter la logique de reconnexion et gérer les rate limits — tout depuis zéro. Les solutions existantes étaient obsolètes, incomplètes, ou liées aux APIs bot-only incompatibles avec les tokens utilisateur.",
    approach: "L'Approche",
    approachText:
      "diself fournit une API async propre et fortement typée qui abstrait la complexité des protocoles gateway et REST de Discord. Vous implémentez un trait EventHandler, et la bibliothèque gère le cycle de vie de la connexion — heartbeats, reprise de session, backoff exponentiel et cache — pour que vous puissiez vous concentrer sur ce que fait réellement votre automatisation.",
    choices: "Choix Techniques",
    choiceAsync: "Async-first sur tokio",
    choiceAsyncText:
      "Les bots Discord doivent traiter de nombreux événements concurrents — messages, mises à jour de présence, changements de guild — sans bloquer. Le runtime async de tokio permet à diself de tout traiter efficacement sur un seul thread, avec des futures zero-cost et un scheduling coopératif.",
    choiceTypes: "Système de types exhaustif",
    choiceTypesText:
      "60+ événements gateway sont modélisés comme des enums Rust typés. Chaque channel, message, guild, rôle et permission a sa propre struct. Si votre handler compile, il gère les données correctement — pas de surprises runtime venant de JSON non typé.",
    choiceResilience: "Résilience intégrée",
    choiceResilienceText:
      "Les coupures réseau arrivent. diself se reconnecte automatiquement, reprend les sessions quand c'est possible, et applique un backoff exponentiel quand le gateway repousse. Les rate limits sur l'API REST sont suivis et relancés de façon transparente.",
    features: "Fonctionnalités Clés",
    feat1: "60+ événements gateway avec handlers typés",
    feat2: "Reconnexion automatique & reprise de session",
    feat3: "Cache configurable (utilisateurs, channels, guilds)",
    feat4: "Builder patterns pour messages & embeds",
    feat5: "Client HTTP conscient des rate limits",
    feat6: "Arrêt gracieux via Client::shutdown()",
    usage: "Exemple d'Utilisation",
    source: "Source & Crate",
    viewOnGithub: "GitHub",
    viewOnCrates: "crates.io",
  },
} as const;

type CopyKey = keyof (typeof copy)["en"];

/* ═══════════════════════════════════════════
   CODE EXAMPLE
   ═══════════════════════════════════════════ */

const CODE_EXAMPLE = `use diself::prelude::*;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn message_create(&self, ctx: Context, msg: Message) {
        if msg.content == "!ping" {
            ctx.http
                .create_message(msg.channel_id)
                .content("Pong!")
                .send()
                .await
                .ok();
        }
    }

    async fn ready(&self, _ctx: Context, user: User) {
        println!("Connected as {}", user.username);
    }
}

#[tokio::main]
async fn main() {
    Client::builder("token")
        .event_handler(Handler)
        .build()
        .await
        .expect("Failed to start client")
        .start()
        .await;
}`;

/* ═══════════════════════════════════════════
   CODE BLOCK COMPONENT
   ═══════════════════════════════════════════ */

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="border border-border bg-[#080808] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f0f] border-b border-border">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
          main.rs
        </span>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none text-fg-muted/20 w-8 shrink-0 text-right mr-4 text-xs leading-relaxed">
                {i + 1}
              </span>
              <CodeLine line={line} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function CodeLine({ line }: { line: string }) {
  // Simple syntax highlighting
  const highlighted = line
    // Strings
    .replace(/"([^"]*)"/g, '<span class="text-[#a8db8a]">"$1"</span>')
    // Comments
    .replace(/(\/\/.*)$/, '<span class="text-fg-muted/40">$1</span>')
    // Keywords
    .replace(
      /\b(use|struct|impl|async|fn|let|if|await|pub|mut|self|return)\b/g,
      '<span class="text-[#c792ea]">$1</span>',
    )
    // Macros
    .replace(
      /\b(println|expect|ok)!/g,
      '<span class="text-[#82aaff]">$1</span>!',
    )
    // Types & traits
    .replace(
      /\b(Handler|Context|Message|Ready|Client|EventHandler|String)\b/g,
      '<span class="text-accent">$1</span>',
    )
    // Attributes
    .replace(/(#\[.*?\])/g, '<span class="text-[#ffcb6b]">$1</span>');

  return (
    <code
      className="text-fg/80"
      dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }}
    />
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function DiselfCaseStudy() {
  const { locale, toggle } = useI18n();
  const t = (key: CopyKey) => copy[locale][key];
  const sectionsRef = useRef<HTMLDivElement>(null);
  const gh = useGitHubStats("daniilsys/diself");
  const crate = useCrateStats("diself");

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

  const features = [
    t("feat1"),
    t("feat2"),
    t("feat3"),
    t("feat4"),
    t("feat5"),
    t("feat6"),
  ];

  return (
    <div ref={sectionsRef}>
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 lg:px-24 py-6 flex items-center justify-between">
        <Link
          href="/#projects"
          className="text-xs tracking-[0.2em] uppercase text-fg-muted hover:text-accent transition-colors duration-150 flex items-center gap-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
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
        <div className="max-w-[800px]">
          {/* ── Hero ── */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] tracking-[0.15em] uppercase text-accent border border-accent/30 px-2 py-1">
                Rust
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
                Async Library
              </span>
            </div>
            <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-light leading-[0.9] tracking-[-0.04em] text-fg mb-6">
              diself
            </h1>
            <p className="text-base md:text-lg text-fg-muted leading-relaxed max-w-[600px]">
              {t("tagline")}
            </p>

            {/* Live stats */}
            {(gh || crate) && (
              <div className="flex items-center gap-6 mt-6">
                {gh && (
                  <div className="flex items-center gap-2 text-sm text-fg-muted/60">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-accent/60">
                      <path d="M8 1.3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.5l4-.6z" />
                    </svg>
                    <span className="text-fg/70">{gh.stars}</span>
                    <span className="text-[10px] tracking-[0.1em] uppercase">stars</span>
                  </div>
                )}
                {crate && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-fg-muted/60">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-accent/60">
                        <path d="M8 1L1 5v6l7 4 7-4V5L8 1zm0 1.2L13.5 5 8 7.8 2.5 5 8 2.2zM2 5.8l5.5 3v5.4L2 11.2V5.8zm7 8.4V8.8l5-3v5.4l-5 3z" />
                      </svg>
                      <span className="text-fg/70">{crate.downloads}</span>
                      <span className="text-[10px] tracking-[0.1em] uppercase">downloads</span>
                    </div>
                    <div className="text-sm text-fg-muted/60">
                      <span className="text-accent/60">v</span>
                      <span className="text-fg/70">{crate.version}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

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
              {(["Async", "Types", "Resilience"] as const).map((key) => (
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

          {/* ── Key Features ── */}
          <section className="section-reveal mb-20">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-8">
              {t("features")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm text-fg/80"
                >
                  <span className="text-accent mt-0.5 shrink-0">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M8 1.3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.5l4-.6z" />
                    </svg>
                  </span>
                  {feat}
                </div>
              ))}
            </div>
          </section>

          {/* ── Usage Example ── */}
          <section className="section-reveal mb-20">
            <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-6">
              {t("usage")}
            </h2>
            <CodeBlock code={CODE_EXAMPLE} />
          </section>

          {/* ── Source ── */}
          <section className="section-reveal pt-10 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-[0.2em] uppercase text-fg-muted">
                {t("source")}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://crates.io/crates/diself"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-fg-muted border border-border px-4 py-2 hover:text-accent hover:border-accent transition-colors duration-150 flex items-center gap-2"
                >
                  <svg
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262.2 2.2 250.1 2.2 239.1 6.3zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z" />
                  </svg>
                  {t("viewOnCrates")}
                </a>
                <a
                  href="https://github.com/daniilsys/diself"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-fg-muted border border-border px-4 py-2 hover:text-accent hover:border-accent transition-colors duration-150 flex items-center gap-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  {t("viewOnGithub")}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
