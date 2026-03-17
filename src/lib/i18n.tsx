"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Locale = "en" | "fr";

const translations = {
  en: {
    tagline: "I build fast software that doesn't break.",
    cta: "See my work",
    about: "About",
    aboutText:
      "Systems and backend developer. I build with Rust, ship real tools, and tackle whatever layer the problem needs - from low-level internals to production interfaces.",
    freelance: "Available for freelance",
    projects: "Projects",
    contact: "Contact",
    contactMe: "Get in touch",
    archived: "archived",
    "desc.sprava":
      "Cross-platform desktop messaging app. Built a full CI/CD pipeline, native auto-updater, and real-time audio pipeline with noise suppression - from scratch to shipped.",
    "desc.diself": "Async Rust library for Discord selfbot automation.",
    "desc.cleanapp":
      "Cross-platform CLI tool that finds and removes leftover files from uninstalled apps.",
    tryDemo: "Try the demo →",
    freelanceWork: "Freelance Work",
    client: "client",
    "desc.telegram-bot":
      "Fully automated Telegram bot for a private client. Handles product delivery, license key management, and cryptocurrency payments - production-ready and actively used.",
    "desc.pc-optim":
      "Desktop application for a private client. Native performance monitoring and system optimization tool built with a focus on low-level efficiency.",
    responseTime: "Response / quote within 48h",
    "form.name": "Name",
    "form.email": "Email",
    "form.message": "Message",
    "form.send": "Send",
    "form.sending": "Sending...",
    "form.sent": "Sent - I'll get back to you.",
    "form.error": "Something went wrong. Try emailing me directly.",
    "form.or": "Or reach out directly",
    "form.copied": "Copied!",
  },
  fr: {
    tagline: "Je fais du logiciel rapide et fiable.",
    cta: "Voir mes projets",
    about: "À propos",
    aboutText:
      "Développeur systèmes et backend. Je travaille en Rust, je livre de vrais outils, et je construis la solution que le problème demande - du bas niveau jusqu'aux interfaces en production.",
    freelance: "Disponible en freelance",
    projects: "Projets",
    contact: "Contact",
    contactMe: "Me contacter",
    archived: "archivé",
    "desc.sprava":
      "Application de messagerie desktop cross-platform. Pipeline CI/CD complet, système de mise à jour automatique natif, et pipeline audio temps réel avec suppression de bruit - de zéro jusqu'au déploiement.",
    "desc.diself":
      "Bibliothèque Rust asynchrone pour l'automatisation de selfbots Discord.",
    "desc.cleanapp":
      "Outil CLI cross-platform pour trouver et supprimer les fichiers résiduels d'apps désinstallées.",
    tryDemo: "Essayer la démo →",
    freelanceWork: "Freelance",
    client: "client",
    "desc.telegram-bot":
      "Bot Telegram entièrement automatisé pour un client privé. Gestion de la livraison de produits, des licences, et des paiements en cryptomonnaie - en production et activement utilisé.",
    "desc.pc-optim":
      "Application desktop pour un client privé. Outil natif de monitoring des performances et d'optimisation système, conçu avec un focus sur l'efficacité bas niveau.",
    responseTime: "Réponse / devis sous 48h",
    "form.name": "Nom",
    "form.email": "Email",
    "form.message": "Message",
    "form.send": "Envoyer",
    "form.sending": "Envoi...",
    "form.sent": "Envoyé - je reviens vers vous.",
    "form.error": "Une erreur est survenue. Essayez par email directement.",
    "form.or": "Ou contactez-moi directement",
    "form.copied": "Copié !",
  },
} as const;

type TranslationKey = keyof (typeof translations)["en"];

interface I18nContextValue {
  locale: Locale;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("locale");
  if (stored === "fr" || stored === "en") return stored;
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === "fr" ? "fr" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(detectLocale());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "en" ? "fr" : "en";
      localStorage.setItem("locale", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key],
    [locale],
  );

  if (!mounted) {
    // SSR/hydration: render with "en" to avoid mismatch
    const tDefault = (key: TranslationKey) => translations["en"][key];
    return (
      <I18nContext.Provider value={{ locale: "en", toggle, t: tDefault }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, toggle, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
