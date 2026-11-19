import posthog from "posthog-js";

/** Fire-and-forget custom event. No-op when PostHog isn't initialised (dev, missing key). */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {}
}

const SECTIONS: [string, string][] = [
  ["about", "#about-section"],
  ["telegram", "#telegram-bot"],
  ["freelance", "[data-section=freelance]"],
  ["projects", "#projects"],
  ["contact", "[data-section=contact]"],
];

/**
 * Scroll depth (25/50/75/100 %) and first view of each section, each sent
 * once per visit. Ignored while the build intro scrolls the page by itself.
 * Returns a cleanup function.
 */
export function trackScroll(): () => void {
  const depths = new Set<number>();
  const seen = new Set<string>();
  const running = () => document.documentElement.classList.contains("intro-running");

  const onScroll = () => {
    if (running()) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = (window.scrollY / max) * 100;
    for (const d of [25, 50, 75, 100]) {
      if (pct >= d - 1 && !depths.has(d)) {
        depths.add(d);
        track("scroll_depth", { percent: d });
      }
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (running()) return;
      for (const e of entries) {
        const name = (e.target as HTMLElement).dataset.trackSection;
        if (e.isIntersecting && name && !seen.has(name)) {
          seen.add(name);
          track("section_viewed", { section: name });
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.3 },
  );
  for (const [name, sel] of SECTIONS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      el.dataset.trackSection = name;
      io.observe(el);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    io.disconnect();
  };
}
