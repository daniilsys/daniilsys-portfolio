import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Cookieless analytics: nothing is stored in the browser (no cookie, no
// localStorage), so no consent banner is needed. Every visit is anonymous.
if (key && process.env.NODE_ENV === "production") {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
    persistence: "memory",
    person_profiles: "identified_only",
    disable_session_recording: true,
  });
}
