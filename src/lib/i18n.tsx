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
    tagline: "I build things that run fast and don't break.",
    cta: "See my work",
    about: "About",
    aboutText:
      "Systems & backend developer. I write Rust, ship real tools, and care about things working correctly at every layer. Joining Epitech Mulhouse in September 2026.",
    freelance: "Open to freelance missions",
    projects: "Projects",
    contact: "Contact",
    contactMe: "Contact me",
    archived: "archived",
    // Project descriptions
    "desc.sprava":
      "Cross-platform desktop messaging app. CI/CD multi-platform, cryptographic auto-updater.",
    "desc.talemy": "Tutoring platform with real-time live messaging.",
    "desc.diself": "Async Rust library for Discord selfbot automation.",
    "desc.apple-music-rpc":
      "macOS daemon syncing Apple Music to Discord Rich Presence via native IPC.",
    "desc.cleanapp":
      "macOS CLI tool to remove leftover files from uninstalled apps.",
  },
  fr: {
    tagline: "Je construis des choses rapides et solides.",
    cta: "Voir mes projets",
    about: "A propos",
    aboutText:
      "Développeur systèmes & backend. J'écris du Rust, je livre de vrais outils, et je m'assure que tout fonctionne correctement à chaque couche. J'intègre Epitech Mulhouse en septembre 2026.",
    freelance: "Disponible en freelance",
    projects: "Projets",
    contact: "Contact",
    contactMe: "Me contacter",
    archived: "archivé",
    "desc.sprava":
      "Application de messagerie desktop multi-plateforme. CI/CD multi-plateforme, auto-updater cryptographique.",
    "desc.talemy":
      "Plateforme de tutorat avec messagerie en temps réel.",
    "desc.diself":
      "Bibliothèque Rust asynchrone pour l'automatisation de selfbots Discord.",
    "desc.apple-music-rpc":
      "Daemon macOS synchronisant Apple Music vers Discord Rich Presence via IPC natif.",
    "desc.cleanapp":
      "Outil CLI macOS pour supprimer les fichiers résiduels d'applications désinstallées.",
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
