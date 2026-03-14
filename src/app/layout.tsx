import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const url = "https://daniilsys.dev";

export const metadata: Metadata = {
  title: "daniil — systems developer",
  description:
    "Systems & backend developer. Rust, TypeScript, low-level tooling. Open to freelance.",
  metadataBase: new URL(url),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "daniil — systems developer",
    description:
      "Systems & backend developer. Rust, low-level tooling. Open to freelance.",
    url,
    siteName: "daniil",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "daniil — systems developer",
    description:
      "Systems & backend developer. Rust, low-level tooling. Open to freelance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistMono.variable}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="font-[family-name:var(--font-mono)] bg-bg text-fg">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
