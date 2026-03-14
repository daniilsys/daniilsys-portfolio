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
      "Systems and backend developer. I write Rust, ship real tools, and obsess over things working correctly at every layer. Joining Epitech Mulhouse in September 2026.",
    freelance: "Available for freelance",
    projects: "Projects",
    contact: "Contact",
    contactMe: "Get in touch",
    archived: "archived",
    "desc.sprava":
      "Cross-platform desktop messaging app with multi-platform CI/CD and a cryptographic auto-updater.",
    "desc.talemy": "Tutoring platform with real-time messaging.",
    "desc.diself": "Async Rust library for Discord selfbot automation.",
    "desc.apple-music-rpc":
      "macOS daemon that syncs Apple Music to Discord Rich Presence via native IPC.",
    "desc.cleanapp":
      "macOS CLI tool that removes leftover files from uninstalled apps.",
    "form.name": "Name",
    "form.email": "Email",
    "form.message": "Message",
    "form.send": "Send",
    "form.sending": "Sending...",
    "form.sent": "Sent — I'll get back to you.",
    "form.error": "Something went wrong. Try emailing me directly.",
    "form.or": "Or reach out directly",
    "form.copied": "Copied!",
  },
  fr: {
    tagline: "Je fais du logiciel rapide et fiable.",
    cta: "Voir mes projets",
    about: "À propos",
    aboutText:
      "Développeur systèmes et backend. J'écris du Rust, je livre de vrais outils et je m'assure que tout tourne correctement à chaque couche. J'intègre Epitech Mulhouse en septembre 2026.",
    freelance: "Disponible en freelance",
    projects: "Projets",
    contact: "Contact",
    contactMe: "Me contacter",
    archived: "archivé",
    "desc.sprava":
      "Application de messagerie desktop multi-plateforme avec CI/CD et auto-updater cryptographique.",
    "desc.talemy":
      "Plateforme de tutorat avec messagerie en temps réel.",
    "desc.diself":
      "Bibliothèque Rust asynchrone pour l'automatisation de selfbots Discord.",
    "desc.apple-music-rpc":
      "Daemon macOS qui synchronise Apple Music vers Discord Rich Presence via IPC natif.",
    "desc.cleanapp":
      "Outil CLI macOS pour supprimer les fichiers résiduels d'apps désinstallées.",
    "form.name": "Nom",
    "form.email": "Email",
    "form.message": "Message",
    "form.send": "Envoyer",
    "form.sending": "Envoi...",
    "form.sent": "Envoyé — je reviens vers vous.",
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
