"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

/*
 * "Live build" intro: four multiplayer cursors build the whole home page in
 * front of the visitor, design-tool style (rulers, dot grid, guides,
 * selections), and the page scrolls to follow their work.
 *
 * Contract with the page:
 * - Elements carry data-intro="<key>". While <html> has the `intro-running`
 *   class they stay hidden until a cursor reveals them (data-intro-shown).
 * - The class is set before paint by an inline script in layout.tsx (home
 *   page only, once per session). No JS / reduced motion = no intro, and a
 *   failsafe drops the class if this component never mounts.
 * - The engine never changes React state or text nodes: it only toggles
 *   attributes and runs Web Animations, all cancelled at the end or on skip.
 */

export const INTRO_SEEN_KEY = "introSeen";

type ActorId = "daniil" | "rustc" | "valgrind" | "intern";

const ACTORS: { id: ActorId; color: string; name: Record<Locale, string> }[] = [
  { id: "daniil", color: "#4DFFB4", name: { en: "daniil", fr: "daniil" } },
  { id: "rustc", color: "#FF8A4C", name: { en: "rustc", fr: "rustc" } },
  { id: "valgrind", color: "#B69CFF", name: { en: "valgrind", fr: "valgrind" } },
  { id: "intern", color: "#60A5FA", name: { en: "intern", fr: "stagiaire" } },
];

// Compiler / tool output stays in English in both locales, on purpose.
const TOOL = {
  compiling: "Compiling hero v0.1.0",
  warning: "warning: type `daniil` should have an upper camel case name",
  leaks: "All heap blocks were freed, no leaks are possible",
  finished: "Finished `release` in 0.42s",
};

const LINES = {
  en: {
    start: "ok, let's build this.",
    intern: "i'll take the copy ✍️",
    valgrind: "watching for leaks 👀",
    styleChoice: "it's a style choice.",
    buttons: "buttons placed ✓",
    scroll: "next section ↓",
    jsWhat: "wait, this one is JavaScript?",
    jsBills: "it paid the bills.",
    nudge: "28px off. fixing.",
    oops: "oops",
    dup: "⌘D ⌘D ⌘D",
    ship: "ship it.",
    cursors: "cursors",
    skip: "skip intro",
    tap: "tap to skip",
    keys: ["click", "space", "esc"],
    deploying: "deploying…",
    deployed: "deployed ✓",
  },
  fr: {
    start: "ok, on construit ça.",
    intern: "je prends les textes ✍️",
    valgrind: "je surveille les fuites 👀",
    styleChoice: "c'est voulu.",
    buttons: "boutons posés ✓",
    scroll: "section suivante ↓",
    jsWhat: "attends, celui-là est en JavaScript ?",
    jsBills: "il a payé les factures.",
    nudge: "28px de décalage, je corrige.",
    oops: "oups",
    dup: "⌘D ⌘D ⌘D",
    ship: "on ship.",
    cursors: "curseurs",
    skip: "passer l'intro",
    tap: "touche pour passer",
    keys: ["clic", "espace", "échap"],
    deploying: "déploiement…",
    deployed: "déployé ✓",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

const WINNER_KF: Keyframe[] = [
  { opacity: 0, transform: "translateY(-14px) scale(0.8)", filter: "brightness(2.5)" },
  { opacity: 1, transform: "translateY(0) scale(1.08)", filter: "brightness(1.6)", offset: 0.6 },
  { opacity: 1, transform: "none", filter: "none" },
];

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

class Aborted extends Error {}

type Tween = {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  start: number;
  dur: number;
  linear: boolean;
  steps: number;
  resolve: () => void;
};

type ActorState = {
  el: HTMLDivElement;
  msg: HTMLSpanElement;
  tag: HTMLDivElement;
  markX: HTMLElement | null;
  markY: HTMLElement | null;
  x: number;
  y: number;
  bend: number;
  tween: Tween | null;
  hideTimer: number;
};

type MoveOpts = { linear?: boolean; steps?: number };
type At = (ms: number) => Promise<void>;

const REVEALS: Record<string, Keyframe[]> = {
  fade: [
    { opacity: 0, transform: "translateY(10px)" },
    { opacity: 1, transform: "none" },
  ],
  pop: [
    { opacity: 0, transform: "scale(0.85)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  drawX: [
    { opacity: 1, transform: "scaleX(0)", transformOrigin: "left" },
    { opacity: 1, transform: "scaleX(1)", transformOrigin: "left" },
  ],
  drawY: [
    { opacity: 1, transform: "scaleY(0)", transformOrigin: "top" },
    { opacity: 1, transform: "scaleY(1)", transformOrigin: "top" },
  ],
};

export default function BuildIntro({
  locale,
  onDone,
}: {
  locale: Locale;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const deployRef = useRef<HTMLSpanElement>(null);
  const cursorRefs = useRef<Partial<Record<ActorId, HTMLDivElement | null>>>({});
  const onDoneRef = useRef(onDone);
  const localeRef = useRef(locale);
  const [vw, setVw] = useState({ w: 0, h: 0 });
  const L = LINES[locale];

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const root = rootRef.current;
    const dots = dotsRef.current;
    const fixed = fixedRef.current;
    const doc = docRef.current;
    const deploy = deployRef.current;
    if (!root || !dots || !fixed || !doc || !deploy) return;

    (window as unknown as { __introStarted?: boolean }).__introStarted = true;
    window.scrollTo({ top: 0, behavior: "instant" });
    const W = window.innerWidth;
    const H = window.innerHeight;
    setVw({ w: W, h: H });

    const text = LINES[localeRef.current];
    const ac = new AbortController();
    const { signal } = ac;
    const anims: Animation[] = [];
    const timers = new Set<number>();
    const created: HTMLElement[] = [];
    const t0 = performance.now();
    let raf = 0;
    let finished = false;
    let scrollTween: { from: number; to: number; start: number; dur: number; resolve: () => void } | null = null;

    // ── actors ────────────────────────────────────────────────────
    const starts: Record<ActorId, [number, number]> = {
      daniil: [W + 40, H * 0.85],
      rustc: [-40, H * 0.15],
      valgrind: [W + 40, H * 0.3],
      intern: [-40, H + 40],
    };
    const actors = {} as Record<ActorId, ActorState>;
    for (const a of ACTORS) {
      const el = cursorRefs.current[a.id]!;
      actors[a.id] = {
        el,
        msg: el.querySelector(".msg") as HTMLSpanElement,
        tag: el.querySelector(".intro-tag") as HTMLDivElement,
        markX: root.querySelector(`[data-mx="${a.id}"]`),
        markY: root.querySelector(`[data-my="${a.id}"]`),
        x: starts[a.id][0],
        y: starts[a.id][1],
        bend: a.id === "rustc" || a.id === "intern" ? 0.12 : -0.12,
        tween: null,
        hideTimer: 0,
      };
    }

    const frame = (now: number) => {
      if (scrollTween) {
        const st = scrollTween;
        const p = Math.min(1, (now - st.start) / st.dur);
        window.scrollTo({ top: st.from + (st.to - st.from) * easeInOut(p), behavior: "instant" });
        if (p >= 1) {
          scrollTween = null;
          st.resolve();
        }
      }
      doc.style.transform = `translate3d(${-window.scrollX}px, ${-window.scrollY}px, 0)`;
      for (const a of Object.values(actors)) {
        const tw = a.tween;
        if (tw) {
          let p = Math.min(1, (now - tw.start) / tw.dur);
          if (tw.steps > 0) p = Math.floor(p * tw.steps) / tw.steps;
          const e = tw.linear ? p : easeInOut(p);
          const u = 1 - e;
          a.x = u * u * tw.fx + 2 * u * e * tw.cx + e * e * tw.tx;
          a.y = u * u * tw.fy + 2 * u * e * tw.cy + e * e * tw.ty;
          if (now - tw.start >= tw.dur) {
            a.x = tw.tx;
            a.y = tw.ty;
            a.tween = null;
            tw.resolve();
          }
        }
        a.el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`;
        // keep the name tag / bubble inside the viewport
        const tw2 = a.tag.offsetWidth;
        let off = 14;
        if (a.x + off + tw2 > W - 8) off = W - 8 - tw2 - a.x;
        if (a.x + off < 8) off = 8 - a.x;
        a.tag.style.left = `${off}px`;
        if (a.markX) a.markX.style.transform = `translateX(${a.x}px)`;
        if (a.markY) a.markY.style.transform = `translateY(${a.y}px)`;
      }
      if (timeRef.current)
        timeRef.current.textContent = ((now - t0) / 1000).toFixed(1);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // ── primitives ────────────────────────────────────────────────
    const guard = <T,>(p: Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        if (signal.aborted) return reject(new Aborted());
        signal.addEventListener("abort", () => reject(new Aborted()), { once: true });
        p.then(resolve);
      });

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    const wait = (ms: number) =>
      guard(new Promise<void>((r) => later(r, Math.max(0, ms))));

    // Run a group of concurrent scripts sharing a local clock.
    const phase = (...scripts: ((at: At) => Promise<unknown>)[]) => {
      const base = performance.now();
      const at: At = (ms) => wait(ms - (performance.now() - base));
      return Promise.all(scripts.map((s) => s(at)));
    };

    const track = (a: Animation) => {
      anims.push(a);
      return a;
    };

    const move = (id: ActorId, x: number, y: number, dur = 700, o: MoveOpts = {}) => {
      const a = actors[id];
      a.tween?.resolve();
      const dx = x - a.x;
      const dy = y - a.y;
      const bend = o.linear ? 0 : a.bend;
      return guard(
        new Promise<void>((resolve) => {
          a.tween = {
            fx: a.x,
            fy: a.y,
            cx: (a.x + x) / 2 - dy * bend,
            cy: (a.y + y) / 2 + dx * bend,
            tx: x,
            ty: y,
            start: performance.now(),
            dur,
            linear: !!o.linear,
            steps: o.steps ?? 0,
            resolve,
          };
        }),
      );
    };

    const scrollToY = (y: number, dur = 900) => {
      const max = document.documentElement.scrollHeight - H;
      const to = Math.max(0, Math.min(max, y));
      scrollTween?.resolve();
      return guard(
        new Promise<void>((resolve) => {
          scrollTween = { from: window.scrollY, to, start: performance.now(), dur, resolve };
        }),
      );
    };

    const nodes = (key: string) =>
      Array.from(document.querySelectorAll<HTMLElement>(`[data-intro="${key}"]`));

    const scrollToKey = (key: string, offset = 0.16, dur = 1000) => {
      const n = nodes(key)[0];
      if (!n) return Promise.resolve();
      return scrollToY(n.getBoundingClientRect().top + window.scrollY - H * offset, dur);
    };

    const say = (id: ActorId, msg: string, ms = 1800) => {
      if (signal.aborted) return;
      const a = actors[id];
      a.msg.textContent = msg;
      a.el.classList.add("saying");
      window.clearTimeout(a.hideTimer);
      a.hideTimer = later(() => a.el.classList.remove("saying"), ms);
    };

    const setMode = (id: ActorId, mode: "arrow" | "text") =>
      actors[id].el.classList.toggle("text", mode === "text");

    // Viewport rect of the first visible element for a key (null if hidden here)
    const box = (key: string, i = 0) => {
      const visible = nodes(key).filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      return visible[i]?.getBoundingClientRect() ?? null;
    };

    const show = (n: HTMLElement) => n.setAttribute("data-intro-shown", "");

    const reveal = (key: string, kind: keyof typeof REVEALS | Keyframe[], dur = 600, i?: number) => {
      if (signal.aborted) return;
      const list = i === undefined ? nodes(key) : nodes(key).slice(i, i + 1);
      for (const n of list) {
        show(n);
        const kf = typeof kind === "string" ? REVEALS[kind] : kind;
        track(n.animate(kf, { duration: dur, easing: EASE_OUT }));
      }
    };

    const colorOf = (id: ActorId) => ACTORS.find((a) => a.id === id)!.color;

    // Selection boxes live in document coordinates so they scroll with the page.
    const select = (id: ActorId, r: DOMRect, label?: string) => {
      const el = document.createElement("div");
      el.className = "intro-sel";
      el.style.setProperty("--c", colorOf(id));
      const pad = 6;
      Object.assign(el.style, {
        left: `${r.left + window.scrollX - pad}px`,
        top: `${r.top + window.scrollY - pad}px`,
        width: `${r.width + pad * 2}px`,
        height: `${r.height + pad * 2}px`,
      });
      el.innerHTML = `<i></i><i></i><i></i><i></i><span></span>`;
      (el.querySelector("span") as HTMLSpanElement).textContent =
        label ?? `${Math.round(r.width)} × ${Math.round(r.height)}`;
      doc.appendChild(el);
      created.push(el);
      track(el.animate(REVEALS.pop, { duration: 250, easing: EASE_OUT }));
      return el;
    };

    const unselect = (el: HTMLElement) => {
      const a = track(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
      a.onfinish = () => el.remove();
    };

    // Line boxes of an element's content, merged per visual line.
    const lineRects = (n: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(n);
      const rows: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 1) continue;
        const row = rows.find((x) => Math.abs(x.top - r.top) < 6 || (r.top < x.bottom - 4 && r.bottom > x.top + 4));
        if (row) {
          row.left = Math.min(row.left, r.left);
          row.right = Math.max(row.right, r.right);
          row.top = Math.min(row.top, r.top);
          row.bottom = Math.max(row.bottom, r.bottom);
        } else rows.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
      }
      return rows.sort((a, b) => a.top - b.top);
    };

    // "Type" an element in, line by line, the I-beam riding the caret.
    // The text itself is untouched: a stepped clip-path uncovers it.
    const typeInto = async (id: ActorId, key: string, perChar: number, i = 0) => {
      const n = nodes(key).filter((x) => x.getBoundingClientRect().width > 0)[i];
      if (!n) return;
      const lines = lineRects(n);
      if (!lines.length) return;
      const b = n.getBoundingClientRect();
      const totalW = lines.reduce((s, l) => s + (l.right - l.left), 0);
      const charW = totalW / Math.max(1, (n.textContent ?? "").trim().length);
      const big = 4000;
      const poly = (x: number, top: number, bot: number) =>
        `polygon(-${big}px -${big}px, ${big}px -${big}px, ${big}px ${top}px, ${x}px ${top}px, ${x}px ${bot}px, -${big}px ${bot}px)`;

      await move(id, lines[0].left, (lines[0].top + lines[0].bottom) / 2, 500);
      setMode(id, "text");
      show(n);
      const mine: Animation[] = [];
      for (const l of lines) {
        const top = l.top - b.top;
        const bot = l.bottom - b.top + 2;
        const x0 = l.left - b.left - 2;
        const x1 = l.right - b.left + 2;
        const chars = Math.max(1, Math.round((l.right - l.left) / charW));
        const dur = chars * perChar;
        const steps = Math.min(chars, 40);
        mine.push(
          track(
            n.animate([{ clipPath: poly(x0, top, bot) }, { clipPath: poly(x1, top, bot) }], {
              duration: dur,
              easing: `steps(${steps}, end)`,
              fill: "forwards",
            }),
          ),
        );
        const y = (l.top + l.bottom) / 2;
        if (Math.abs(actors[id].x - l.left) > 4) await move(id, l.left, y, 90, { linear: true });
        await move(id, l.right, y, dur, { linear: true, steps });
      }
      mine.forEach((a) => a.cancel());
      setMode(id, "arrow");
    };

    // Drag an element into place from an offset, with its selection box.
    // `land` leaves it slightly off target (for a later nudge).
    const dragIn = async (id: ActorId, key: string, dx: number, dy: number, dur = 850, land = 0, i = 0) => {
      const r = box(key, i);
      if (!r) return null;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      await move(id, cx + dx, cy + dy, 550);
      const sel = select(id, r);
      const end = land ? `translateX(${land}px)` : "none";
      const kf: Keyframe[] = [
        { opacity: 0.4, transform: `translate(${dx + land}px, ${dy}px)` },
        { opacity: 1, transform: end },
      ];
      const list = nodes(key).filter((x) => x.getBoundingClientRect().width > 0);
      const n = list[i];
      if (!n) return null;
      show(n);
      const anim = track(n.animate(kf, { duration: dur, easing: EASE_OUT, fill: land ? "forwards" : "none" }));
      track(sel.animate(kf, { duration: dur, easing: EASE_OUT, fill: "forwards" }));
      await move(id, cx + land, cy, dur * 0.8);
      later(() => unselect(sel), 450);
      return anim;
    };

    const fixedEl = (cls: string, color?: string) => {
      const el = document.createElement("div");
      el.className = cls;
      if (color) el.style.setProperty("--c", color);
      fixed.appendChild(el);
      created.push(el);
      return el;
    };

    const guide = (x: number, fromBottom: boolean) => {
      const g = fixedEl("intro-guide");
      g.style.left = `${Math.round(x)}px`;
      const origin = fromBottom ? "bottom" : "top";
      track(
        g.animate(
          [
            { transform: "scaleY(0)", transformOrigin: origin },
            { transform: "scaleY(1)", transformOrigin: origin },
          ],
          { duration: 550, easing: EASE_IN_OUT },
        ),
      );
    };

    const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

    const popAt = async (id: ActorId, key: string, dur = 600, kind: keyof typeof REVEALS = "pop") => {
      const r = box(key);
      if (!r) return;
      const c = center(r);
      await move(id, c.x, c.y, dur);
      reveal(key, kind, 450);
    };

    // ── 1. hero ───────────────────────────────────────────────────
    const nameR = box("name");
    const gl = nameR ? nameR.left : 24;
    const gr = W - gl;

    const hero = () =>
      phase(
        async (at) => {
          await at(150);
          await move("daniil", W * 0.52, H * 0.55, 900);
          say("daniil", text.start, 1800);
          await at(1300);
          await move("daniil", gl, 60, 600);
          guide(gl, false);
          await move("daniil", gl, H - 60, 550, { linear: true });
          await move("daniil", gr, H - 60, 450);
          guide(gr, true);
          await move("daniil", gr, 60, 550, { linear: true });
          await at(2700);
          await typeInto("daniil", "name", 120);
          const lr = box("line");
          if (lr) {
            await move("daniil", lr.left, lr.top, 350);
            reveal("line", "drawX", 550);
            await move("daniil", lr.right, lr.top, 550, { linear: true });
          }
          await at(4900);
          say("daniil", text.styleChoice, 1600);
          await at(6300);
          const sr = box("stats");
          if (sr) {
            await move("daniil", sr.left + sr.width * 0.3, sr.top + sr.height / 2, 600);
            reveal("stats", "fade", 600);
          }
        },
        async (at) => {
          await at(250);
          await move("rustc", W * 0.25, H * 0.22, 700);
          say("rustc", TOOL.compiling, 1600);
          const { x, y } = actors.rustc;
          dots.style.clipPath = "none";
          track(
            dots.animate(
              [
                { clipPath: `circle(0px at ${x}px ${y}px)` },
                { clipPath: `circle(${Math.hypot(W, H) * 1.1}px at ${x}px ${y}px)` },
              ],
              { duration: 1200, easing: EASE_IN_OUT },
            ),
          );
          await move("rustc", W * 0.4, H * 0.3, 900);
          await popAt("rustc", "coords");
          await popAt("rustc", "lang", 900);
          await at(3950);
          const nr = box("name");
          if (nr) {
            await move("rustc", nr.right - 6, nr.bottom - 10, 600);
            const sel = select("rustc", nr, "warning");
            sel.classList.add("warn");
            say("rustc", TOOL.warning, 2200);
            await at(5900);
            unselect(sel);
          }
          await at(6600);
          const sc = box("scroll");
          if (sc) {
            await move("rustc", sc.left, sc.top, 600);
            reveal("scroll", "drawY", 500);
          }
          await popAt("rustc", "replay", 700);
        },
        async (at) => {
          await at(600);
          await move("valgrind", W * 0.78, H * 0.38, 900);
          say("valgrind", text.valgrind, 1700);
          await at(1900);
          if (box("constellation")) await dragIn("valgrind", "constellation", 180, 0, 1000);
          else await move("valgrind", W * 0.7, H * 0.7, 900);
          await at(6900);
          const sr = box("stats");
          if (sr) {
            await move("valgrind", sr.right + 8, sr.bottom + 4, 600);
            const sel = select("valgrind", sr);
            say("valgrind", TOOL.leaks, 1600);
            later(() => unselect(sel), 1200);
          }
        },
        async (at) => {
          await at(450);
          await move("intern", W * 0.2, H * 0.4, 1000);
          say("intern", text.intern, 1800);
          await at(2000);
          const tr = box("tagline");
          if (tr) await move("intern", tr.left - 30, tr.bottom + 50, 900);
          await at(4300);
          await typeInto("intern", "tagline", 32);
          reveal("caret", "fade", 300);
          await popAt("intern", "avail", 400);
          await at(6000);
          await dragIn("intern", "ctas", 0, 70, 800);
          say("intern", text.buttons, 1400);
        },
      );

    // Park the cursors around the viewport between sections.
    const regroup = (at: At, ms: number) =>
      Promise.all([
        at(ms).then(() => move("daniil", W * 0.62, H * 0.82, 700)),
        at(ms).then(() => move("rustc", W * 0.8, H * 0.2, 700)),
        at(ms).then(() => move("valgrind", W * 0.9, H * 0.55, 700)),
        at(ms).then(() => move("intern", W * 0.15, H * 0.75, 700)),
      ]);

    // ── 2. about ──────────────────────────────────────────────────
    const about = () =>
      phase(
        async (at) => {
          say("daniil", text.scroll, 1200);
          await at(150);
          await scrollToKey("about-h", 0.2, 1100);
          await typeInto("daniil", "about-h", 60);
        },
        async (at) => {
          await regroup(at, 0);
          await at(1500);
          await typeInto("intern", "about-p", 11);
        },
        async (at) => {
          await at(1400);
          await dragIn("valgrind", "about-edu", -140, 0, 800);
        },
        async (at) => {
          await at(2400);
          await popAt("rustc", "about-free", 700, "fade");
        },
      );

    // ── 3. telegram spotlight ─────────────────────────────────────
    const spotlight = () =>
      phase(
        async (at) => {
          await scrollToKey("tg-h", 0.12, 1100);
          await typeInto("daniil", "tg-h", 45);
          await typeInto("daniil", "tg-title", 45);
          await at(4200);
          say("daniil", text.jsBills, 1600);
          await at(4600);
          await popAt("daniil", "tg-stats", 600, "fade");
        },
        async (at) => {
          await at(1700);
          const b = box("tg-badge");
          if (b) {
            await move("rustc", b.left, b.top + b.height / 2, 600);
            reveal("tg-badge", "pop", 400);
          }
          await at(2300);
          if (box("tg-term")) {
            await dragIn("rustc", "tg-term", 220, 0, 900);
          }
          say("rustc", text.jsWhat, 1900);
        },
        async (at) => {
          await at(1900);
          await typeInto("intern", "tg-desc", 9);
          await popAt("intern", "tg-chips", 450, "fade");
        },
        async (at) => {
          await at(5300);
          await dragIn("valgrind", "tg-cta", 0, 50, 700);
        },
      );

    // ── 4. freelance + projects ───────────────────────────────────
    const work = () =>
      phase(
        async (at) => {
          await scrollToKey("fw-h", 0.14, 1000);
          await typeInto("daniil", "fw-h", 45);
          await at(2900);
          // intern dropped the row 28px off; daniil nudges it back
          const r = box("fw-row");
          const n = nodes("fw-row")[0];
          if (r && n) {
            await move("daniil", r.left + 40, r.top + r.height / 2, 450);
            const sel = select("daniil", r, "⇧ ← ×28");
            say("daniil", text.nudge, 1500);
            const kf: Keyframe[] = [{ transform: "translateX(28px)" }, { transform: "none" }];
            track(n.animate(kf, { duration: 500, easing: "steps(4, end)", fill: "forwards" }));
            track(sel.animate([{ transform: "none" }, { transform: "translateX(-28px)" }], { duration: 500, easing: "steps(4, end)", fill: "forwards" }));
            await move("daniil", r.left + 12, r.top + r.height / 2, 500, { steps: 4 });
            later(() => unselect(sel), 600);
          }
          await at(4000);
          await scrollToKey("pj-h", 0.12, 900);
          await typeInto("daniil", "pj-h", 50);
        },
        async (at) => {
          await at(1500);
          await dragIn("intern", "fw-row", -120, 0, 800, 28);
          say("intern", text.oops, 900);
        },
        async (at) => {
          await at(5600);
          await popAt("rustc", "pj-filters", 600, "fade");
        },
        async (at) => {
          await at(5700);
          const rows = nodes("project").filter((n) => n.getBoundingClientRect().width > 0);
          if (!rows.length) return;
          await dragIn("valgrind", "project", -160, 0, 700);
          say("valgrind", text.dup, 1600);
          for (let i = 1; i < rows.length; i++) {
            const prev = rows[i - 1].getBoundingClientRect();
            const r = rows[i].getBoundingClientRect();
            if (r.bottom > H - 40) await scrollToY(window.scrollY + r.bottom - H * 0.75, 450);
            const rr = rows[i].getBoundingClientRect();
            await move("valgrind", rr.left + rr.width * 0.4, rr.top + rr.height / 2, 260);
            show(rows[i]);
            track(
              rows[i].animate(
                [
                  { opacity: 0.3, transform: `translateY(${prev.top - r.top}px)` },
                  { opacity: 1, transform: "none" },
                ],
                { duration: 380, easing: EASE_OUT },
              ),
            );
            await wait(220);
          }
        },
      );

    // ── 5. contact + deploy ───────────────────────────────────────
    const finale = () =>
      phase(
        async (at) => {
          await scrollToY(document.documentElement.scrollHeight, 1100);
          await at(1500);
          const b = box("cta-btn");
          if (b) await dragIn("daniil", "cta-btn", 0, 60, 700);
          await at(3300);
          const c = box("cta-btn");
          if (c) await move("daniil", c.right + 16, c.top + c.height / 2, 500);
          say("daniil", text.ship, 1400);
        },
        async (at) => {
          await at(1200);
          await typeInto("intern", "cta-p", 30);
        },
        async (at) => {
          await at(1900);
          await popAt("rustc", "cta-small", 500, "fade");
          await popAt("rustc", "footer", 600, "fade");
          await at(3900);
          say("rustc", TOOL.finished, 1800);
        },
        async (at) => {
          await at(2600);
          const r = box("cta-btn");
          if (r) await move("valgrind", r.left - 40, r.bottom + 30, 700);
          await at(3600);
          deploy.textContent = text.deploying;
          deploy.parentElement!.classList.add("on");
          await at(4900);
          deploy.textContent = text.deployed;
          deploy.parentElement!.classList.add("ok");
        },
      );

    const finalize = (skipped: boolean) => {
      if (finished) return;
      finished = true;
      ac.abort();
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      anims.forEach((a) => a.cancel());
      document.querySelectorAll("[data-intro-shown]").forEach((n) => n.removeAttribute("data-intro-shown"));
      document.documentElement.classList.remove("intro-running");
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      if (skipped) {
        // skipping still ends at the top, with the winner badge landing
        window.scrollTo(0, 0);
        document.querySelector<HTMLElement>('[data-intro="winner"]')?.animate(WINNER_KF, {
          duration: 800,
          delay: 350,
          easing: EASE_OUT,
          fill: "backwards",
        });
        root.classList.add("leaving");
        window.setTimeout(() => onDoneRef.current(), 350);
      } else {
        onDoneRef.current();
      }
    };

    const run = async () => {
      try {
        await hero();
        await about();
        await spotlight();
        await work();
        await finale();
        await wait(900);
        // back to the top while everyone leaves
        root.classList.add("leaving");
        await Promise.all([
          scrollToY(0, 1400),
          move("daniil", W + 60, H * 0.7, 900),
          move("rustc", -60, H * 0.2, 900),
          move("valgrind", W + 60, H * 0.15, 900),
          move("intern", -60, H + 60, 900),
        ]);
        // last beat: the winner badge lands above the name
        const wb = box("winner");
        if (wb) {
          await move("daniil", Math.min(wb.right + 24, W - 40), wb.top + wb.height / 2, 600);
          reveal("winner", WINNER_KF, 800);
          say("daniil", "GG", 1400);
          await wait(1500);
        }
        finalize(false);
      } catch (e) {
        if (!(e instanceof Aborted)) throw e;
      }
    };
    run();

    // Any input skips: click, keys, wheel, touch scroll.
    const onKey = (e: KeyboardEvent) => {
      if ([" ", "Escape", "Enter", "ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) {
        e.preventDefault();
        finalize(true);
      }
    };
    const skip = () => finalize(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    root.addEventListener("pointerdown", skip);

    return () => {
      // Dev StrictMode re-runs effects: undo side effects without marking
      // the intro as seen.
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      root.removeEventListener("pointerdown", skip);
      if (finished) return;
      ac.abort();
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      anims.forEach((a) => a.cancel());
      created.forEach((el) => el.remove());
      dots.style.clipPath = "";
      root.classList.remove("leaving");
      deploy.parentElement!.classList.remove("on", "ok");
      for (const a of Object.values(actors)) {
        window.clearTimeout(a.hideTimer);
        a.el.classList.remove("saying", "text");
      }
      document.querySelectorAll("[data-intro-shown]").forEach((n) => n.removeAttribute("data-intro-shown"));
    };
  }, []);

  const xLabels = Array.from({ length: Math.ceil(vw.w / 100) }, (_, i) => i * 100);
  const yLabels = Array.from({ length: Math.ceil(vw.h / 100) }, (_, i) => i * 100);

  return (
    <div ref={rootRef} className="intro-root" role="presentation" aria-hidden="true">
      <div className="intro-chrome">
        <div ref={dotsRef} className="intro-dots" />
        <div ref={docRef} className="intro-doc" />
        <div ref={fixedRef} className="intro-fixed" />

        <div className="intro-ruler intro-ruler-x">
          {xLabels.map((v) => (
            <span key={v} style={{ left: v + 3 }}>
              {v || ""}
            </span>
          ))}
          {ACTORS.map((a) => (
            <i key={a.id} data-mx={a.id} style={{ background: a.color }} />
          ))}
        </div>
        <div className="intro-ruler intro-ruler-y">
          {yLabels.map((v) => (
            <span key={v} style={{ top: v + 3 }}>
              {v || ""}
            </span>
          ))}
          {ACTORS.map((a) => (
            <i key={a.id} data-my={a.id} style={{ background: a.color }} />
          ))}
        </div>
        <div className="intro-ruler-corner" />

        <div className="intro-hud">
          <span>
            {ACTORS.length} {L.cursors} · <span ref={timeRef}>0.0</span>s
          </span>
          <span className="intro-hud-deploy">
            <b />
            <span ref={deployRef} />
          </span>
          <span className="intro-hud-desktop">
            {L.skip}
            {L.keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}
          </span>
          <span className="intro-hud-mobile">{L.tap}</span>
        </div>
      </div>

      {ACTORS.map((a) => (
        <div
          key={a.id}
          ref={(el) => {
            cursorRefs.current[a.id] = el;
          }}
          className="intro-cursor"
          style={{ "--c": a.color } as React.CSSProperties}
        >
          <svg className="arrow" width="18" height="20" viewBox="0 0 18 20">
            <path
              d="M1.5 1.5 L16 9.2 L9.4 10.8 L6.4 17.6 Z"
              fill="var(--c)"
              stroke="#0a0a0a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <svg className="ibeam" width="12" height="22" viewBox="0 0 12 22">
            <path
              d="M2 1.5 H4.5 Q6 1.5 6 3 V19 Q6 20.5 4.5 20.5 H2 M10 1.5 H7.5 Q6 1.5 6 3 M6 19 Q6 20.5 7.5 20.5 H10"
              fill="none"
              stroke="var(--c)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <div className="intro-tag">
            <b>{a.name[locale]}</b>
            <span className="msg" />
          </div>
        </div>
      ))}
    </div>
  );
}
