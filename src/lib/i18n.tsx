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
      "Systems and backend developer, Epitech student. I build with Rust and C, ship real tools, and tackle whatever layer the problem needs - from low-level internals to production interfaces.",
    freelance: "Available for freelance",
    student: "Epitech student",
    education: "Education",
    educationDetail: "Epitech - Computer science, ongoing",
    projects: "Projects",
    contact: "Contact",
    contactMe: "Get in touch",
    archived: "archived",
    featured: "featured",
    "desc.sprava":
      "Cross-platform desktop messaging app. Built a full CI/CD pipeline, native auto-updater, and real-time audio pipeline with noise suppression - from scratch to shipped.",
    "desc.epiplan":
      "MCP server for the my.epitech.eu planning. Check what's open and register to activities with dry runs, guardrails and Microsoft SSO login.",
    "desc.kerak":
      "AI-powered nutrition assistant. Calorie tracking, recipe generation, weekly meal planning - all driven by Mistral AI.",
    "desc.diself": "Async Rust library for Discord selfbot automation.",
    "desc.cleanapp":
      "Cross-platform CLI tool that finds and removes leftover files from uninstalled apps.",
    tryDemo: "Try the demo →",
    freelanceWork: "Freelance Work",
    client: "client",
    "desc.telegram-bot":
      "Fully automated Telegram bot built for a private client. Handled product delivery, license key management, and cryptocurrency payments. The project has ended since the client stopped the activity.",
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
    spotlight: "Client Spotlight",
    "telegram.clients": "clients served",
    "telegram.uptime": "availability",
    "telegram.auto": "automated delivery",
    "telegram.cta": "Have a similar project?",
    "telegram.since": "project ended · client stopped the activity",
    "tgDemo.offline": "offline",
    "tgDemo.bot": "bot",
    "tgDemo.balance": "Your balance:",
    "tgDemo.categories": "Categories:",
    "tgDemo.products": "Products:",
    "tgDemo.question": "What would you like to do?",
    "tgDemo.topup": "Top up",
    "tgDemo.categoriesBtn": "Categories",
    "tgDemo.allProducts": "All products",

    statsStack: "stack",
    caseStudy: "Case study →",
  },
  fr: {
    tagline: "Je fais du logiciel rapide et fiable.",
    cta: "Voir mes projets",
    about: "À propos",
    aboutText:
      "Développeur systèmes et backend, étudiant à Epitech. Je travaille en Rust et en C, je livre de vrais outils, et je construis la solution que le problème demande - du bas niveau jusqu'aux interfaces en production.",
    freelance: "Disponible en freelance",
    student: "Étudiant à Epitech",
    education: "Formation",
    educationDetail: "Epitech - Informatique, en cours",
    projects: "Projets",
    contact: "Contact",
    contactMe: "Me contacter",
    archived: "archivé",
    featured: "top",
    "desc.sprava":
      "Application de messagerie desktop cross-platform. Pipeline CI/CD complet, système de mise à jour automatique natif, et pipeline audio temps réel avec suppression de bruit - de zéro jusqu'au déploiement.",
    "desc.epiplan":
      "Serveur MCP pour le planning my.epitech.eu. Consultez les activités ouvertes et inscrivez-vous avec dry runs, garde-fous et connexion SSO Microsoft.",
    "desc.kerak":
      "Assistant nutrition propulsé par IA. Suivi calorique, génération de recettes, planning hebdomadaire - le tout piloté par Mistral AI.",
    "desc.diself":
      "Bibliothèque Rust asynchrone pour l'automatisation de selfbots Discord.",
    "desc.cleanapp":
      "Outil CLI cross-platform pour trouver et supprimer les fichiers résiduels d'apps désinstallées.",
    tryDemo: "Essayer la démo →",
    freelanceWork: "Freelance",
    client: "client",
    "desc.telegram-bot":
      "Bot Telegram entièrement automatisé développé pour un client privé. Gérait la livraison de produits, les licences et les paiements en cryptomonnaie. Le projet est terminé : le client a arrêté son activité.",
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
    spotlight: "Cas client",
    "telegram.clients": "clients servis",
    "telegram.uptime": "disponibilité",
    "telegram.auto": "livraison automatisée",
    "telegram.cta": "Un projet similaire ?",
    "telegram.since": "projet terminé · le client a arrêté son activité",
    "tgDemo.offline": "hors ligne",
    "tgDemo.bot": "bot",
    "tgDemo.balance": "Votre solde :",
    "tgDemo.categories": "Catégories :",
    "tgDemo.products": "Produits :",
    "tgDemo.question": "Que souhaitez-vous faire ?",
    "tgDemo.topup": "Recharger",
    "tgDemo.categoriesBtn": "Catégories",
    "tgDemo.allProducts": "Tous les produits",
    statsStack: "stack",
    caseStudy: "En savoir plus →",
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
