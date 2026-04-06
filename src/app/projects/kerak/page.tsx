"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useGitHubStats } from "@/lib/stats";
import Link from "next/link";

/* ═══════════════════════════════════════════
   CASE STUDY TRANSLATIONS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    back: "Back",
    tagline:
      "AI-powered personal nutrition assistant. Calorie tracking, recipe generation, weekly meal planning and nutrition advice - all driven by Mistral AI.",
    demo: "Demo",
    problem: "The Problem",
    problemText:
      "Tracking nutrition manually is tedious - counting calories, balancing macros, finding recipes that fit your goals. Existing apps are either too complex, filled with ads, or lack intelligent suggestions. There's no simple tool that understands what you eat in plain language and builds a personalized plan around it.",
    approach: "The Approach",
    approachText:
      "Kerak lets you log meals in natural language - just say what you ate and the AI figures out the rest. It generates recipes from your ingredients, builds weekly meal plans based on your goals, and gives personalized nutrition advice. The whole experience is conversational and effortless.",
    choices: "Technical Choices",
    choiceAI: "Mistral AI for everything",
    choiceAIText:
      "Natural language meal parsing, recipe generation from ingredients, weekly routine planning, and nutrition analysis - all powered by Mistral Small. Structured JSON output keeps the responses reliable and parseable.",
    choiceStack: "React Native + Expo",
    choiceStackText:
      "Cross-platform mobile app with NativeWind for styling. Zustand for state management keeps things simple and performant. Expo handles the build pipeline and push notifications.",
    choiceBackend: "Express + Prisma + PostgreSQL",
    choiceBackendText:
      "Clean REST API with Prisma ORM for type-safe database access. CIQUAL ingredient database (~10,000 entries) for accurate nutritional data. Node-cron generates fresh daily recipes every morning at 5 AM.",
    features: "Key Features",
    feat1: "Natural language meal logging with AI parsing",
    feat2: "Recipe generation from your ingredients",
    feat3: "Weekly meal plans based on your goals & budget",
    feat4: "Macro tracking with personalized nutrition advice",
    feat5: "Smart suggestions from favorite recipes",
    feat6: "Step-by-step cooking mode with progress",
    feat7: "Daily auto-generated recipes (5 AM cron)",
    feat8: "Customizable meal reminders & themes",
    stack: "Tech Stack",
    stackMobile: "Mobile",
    stackMobileText:
      "React Native 0.81, Expo 54, Zustand, NativeWind, react-native-chart-kit",
    stackBackend: "Backend",
    stackBackendText: "Express 5.1, Prisma 7.6, node-cron, JWT auth",
    stackAI: "AI",
    stackAIText: "Mistral Small (recipe gen, meal parsing, nutrition advice)",
    stackDB: "Database",
    stackDBText: "PostgreSQL 16, CIQUAL ingredient database (~10,000 entries)",
    source: "Source",
    viewOnGithub: "GitHub",
  },
  fr: {
    back: "Retour",
    tagline:
      "Assistant nutrition personnel propulsé par IA. Suivi calorique, génération de recettes, planning hebdomadaire et conseils nutritionnels - le tout piloté par Mistral AI.",
    demo: "Démo",
    problem: "Le Problème",
    problemText:
      "Suivre sa nutrition manuellement est fastidieux - compter les calories, équilibrer les macros, trouver des recettes adaptées à ses objectifs. Les apps existantes sont soit trop complexes, remplies de pubs, ou manquent de suggestions intelligentes. Il n'existe pas d'outil simple qui comprend ce que vous mangez en langage naturel et construit un plan personnalisé autour.",
    approach: "L'Approche",
    approachText:
      "Kerak vous permet de logger vos repas en langage naturel - dites simplement ce que vous avez mangé et l'IA fait le reste. Elle génère des recettes à partir de vos ingrédients, construit des plans hebdomadaires selon vos objectifs, et donne des conseils nutrition personnalisés. L'expérience est conversationnelle et sans effort.",
    choices: "Choix Techniques",
    choiceAI: "Mistral AI pour tout",
    choiceAIText:
      "Parsing de repas en langage naturel, génération de recettes à partir d'ingrédients, planification de routine hebdomadaire et analyse nutritionnelle - le tout propulsé par Mistral Small. La sortie JSON structurée garantit des réponses fiables et parsables.",
    choiceStack: "React Native + Expo",
    choiceStackText:
      "App mobile cross-platform avec NativeWind pour le styling. Zustand pour la gestion d'état garde les choses simples et performantes. Expo gère le pipeline de build et les notifications push.",
    choiceBackend: "Express + Prisma + PostgreSQL",
    choiceBackendText:
      "API REST propre avec Prisma ORM pour un accès base de données type-safe. Base d'ingrédients CIQUAL (~10 000 entrées) pour des données nutritionnelles précises. Node-cron génère de nouvelles recettes quotidiennes chaque matin à 5h.",
    features: "Fonctionnalités Clés",
    feat1: "Logging de repas en langage naturel avec parsing IA",
    feat2: "Génération de recettes à partir de vos ingrédients",
    feat3: "Plans repas hebdomadaires selon vos objectifs & budget",
    feat4: "Suivi des macros avec conseils nutrition personnalisés",
    feat5: "Suggestions intelligentes depuis vos recettes favorites",
    feat6: "Mode cuisine étape par étape avec progression",
    feat7: "Recettes auto-générées quotidiennement (cron 5h)",
    feat8: "Rappels de repas personnalisables & thèmes",
    stack: "Stack Technique",
    stackMobile: "Mobile",
    stackMobileText:
      "React Native 0.81, Expo 54, Zustand, NativeWind, react-native-chart-kit",
    stackBackend: "Backend",
    stackBackendText: "Express 5.1, Prisma 7.6, node-cron, auth JWT",
    stackAI: "IA",
    stackAIText:
      "Mistral Small (génération de recettes, parsing de repas, conseils nutrition)",
    stackDB: "Base de données",
    stackDBText: "PostgreSQL 16, base d'ingrédients CIQUAL (~10 000 entrées)",
    source: "Source",
    viewOnGithub: "GitHub",
  },
} as const;

type CopyKey = keyof (typeof copy)["en"];

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function KerakCaseStudy() {
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

  const features = [
    t("feat1"),
    t("feat2"),
    t("feat3"),
    t("feat4"),
    t("feat5"),
    t("feat6"),
    t("feat7"),
    t("feat8"),
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
        {/* ── Hero ── */}
        <div className="max-w-[1100px] mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] tracking-[0.15em] uppercase text-accent border border-accent/30 px-2 py-1">
              Full-Stack
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-fg-muted/40">
              Mobile App
            </span>
          </div>
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-light leading-[0.9] tracking-[-0.04em] text-fg mb-6">
            kerak
          </h1>
          <p className="text-base md:text-lg text-fg-muted leading-relaxed max-w-[600px]">
            {t("tagline")}
          </p>
        </div>

        {/* ── Two-column: sticky video + scrolling content ── */}
        <div className="max-w-[1100px] flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ── Sticky video (left) ── */}
          <div className="lg:w-[280px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
                {t("demo")}
              </h2>
              <div className="border border-border bg-[#080808] overflow-hidden rounded-[20px]">
                <video
                  src="https://github.com/user-attachments/assets/eaee7f52-b44e-43c4-9ca2-d3f6448b3a04"
                  controls
                  className="w-full"
                  playsInline
                />
              </div>
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
                {(["AI", "Stack", "Backend"] as const).map((key) => (
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

            {/* ── Tech Stack ── */}
            <section className="section-reveal mb-20">
              <h2 className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-8">
                {t("stack")}
              </h2>
              <div className="grid gap-6">
                {(["Mobile", "Backend", "AI", "DB"] as const).map((key) => (
                  <div key={key} className="border-l-2 border-accent/20 pl-6">
                    <h3 className="text-sm font-medium text-fg mb-1">
                      {t(`stack${key}` as CopyKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-fg-muted">
                      {t(`stack${key}Text` as CopyKey)}
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
                  href="https://github.com/daniilsys/kerak"
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
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
