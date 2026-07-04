import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  TrendingUp,
  Bot,
  MapPin,
  CheckSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Bell,
  Activity,
  Play,
  Quote,
  Check,
  X,
} from "lucide-react";
import logoIcon from "@/assets/logo-mark-v3.png";
import logoFull from "@/assets/logo-full.png";

const modules = [
  {
    icon: MapPin,
    title: "Location Intelligence",
    desc: "Every location, license, and audit in one command center — with per-unit drill-down.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Scoring",
    desc: "Real-time 0–100 scoring with automatic remediation tasks the moment a check fails.",
  },
  {
    icon: Bot,
    title: "Franchise Brain",
    desc: "An AI assistant grounded in your live portfolio data — every answer cited to the source.",
  },
  {
    icon: TrendingUp,
    title: "Expansion Readiness",
    desc: "Know exactly which states are ready for your next unit, scored from live signals.",
  },
  {
    icon: CheckSquare,
    title: "Task Automation",
    desc: "Failed checks become prioritized tasks — automatically routed and tracked to done.",
  },
  {
    icon: FileText,
    title: "Document Hub",
    desc: "SOPs, policies, and agreements — searchable, centralized, and secured.",
  },
];

const stats = [
  { value: "128", label: "Locations tracked" },
  { value: "87", label: "Avg compliance score" },
  { value: "24/7", label: "Live risk monitoring" },
  { value: "1", label: "Command center" },
];

const testimonials = [
  {
    quote:
      "We went from spreadsheets and Slack threads to a single source of truth. Renewals stopped slipping through the cracks overnight.",
    name: "Dana Whitfield",
    role: "VP Operations, 60-unit QSR group",
  },
  {
    quote:
      "The AI assistant answers portfolio questions in seconds — with citations. My ops reviews are half as long now.",
    name: "Marcus Lee",
    role: "Director of Franchise Compliance",
  },
  {
    quote:
      "Expansion readiness scoring told us where to open next before our analysts finished the deck. Genuinely a superpower.",
    name: "Priya Nandakumar",
    role: "Chief Development Officer",
  },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section id={id} {...reveal} className={className}>
      {children}
    </motion.section>
  );
}

export default function Landing() {
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introLoaded, setIntroLoaded] = useState(false);

  useEffect(() => {
    if (!showIntro) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowIntro(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [showIntro]);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white antialiased overflow-x-hidden">
      {/* Autoplay intro video overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md px-4 py-6"
            onClick={() => setShowIntro(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Product demo"
          >
            {/* Top bar */}
            <div className="w-full max-w-5xl flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                Now playing — 90-second product tour
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIntro(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                Skip <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video frame */}
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-indigo-950/50"
              onClick={(e) => e.stopPropagation()}
            >
              {!introLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                    Loading demo…
                  </div>
                </div>
              )}
              <iframe
                src="/demo/"
                title="FranchiseIntelligenceOS product demo"
                className="absolute inset-0 h-full w-full"
                onLoad={() => setIntroLoaded(true)}
                allow="autoplay; fullscreen"
              />
            </motion.div>

            {/* Bottom hint + dismiss */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <p className="text-xs text-slate-400">
                Starts muted — use the volume button in the video to hear the narration.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIntro(false);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-colors"
              >
                Explore the platform <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-1/3 right-0 h-[38rem] w-[38rem] rounded-full bg-sky-500/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="" className="h-9 w-auto" />
            <span className="font-semibold text-lg tracking-tight">
              FranchiseIntelligence<span className="text-blue-400">OS</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#platform" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo
            </a>
            <a href="#modules" className="hover:text-white transition-colors">
              Modules
            </a>
            <a href="#customers" className="hover:text-white transition-colors">
              Customers
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 text-center">
          <motion.div {...reveal} className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              AI-native operations for multi-unit franchises
            </div>
            <img
              src={logoFull}
              alt="FranchiseIntelligenceOS — Intelligence. Compliance. Growth."
              className="h-44 md:h-52 w-auto mx-auto mt-8 mb-8 drop-shadow-[0_0_55px_rgba(99,102,241,0.3)]"
            />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto">
              The operating system for{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                elite franchise portfolios
              </span>
            </h1>
            <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              Track every location, score compliance in real time, and ask your AI
              analyst anything about your portfolio — all in one executive command
              center.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 group"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch the demo
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            {...reveal}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-slate-950/40 px-6 py-6">
                <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Dashboard preview */}
        <Section id="platform" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your entire portfolio, at a glance
            </h2>
            <p className="text-slate-400 mt-4">
              A live command center that surfaces what needs attention — before it
              becomes a problem.
            </p>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 md:p-6 shadow-2xl shadow-indigo-950/40">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-slate-500">
                  Dashboard — Portfolio overview
                </span>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-3">
                {/* KPI cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Locations", value: "128", tone: "text-white" },
                    { label: "Avg compliance", value: "87", tone: "text-emerald-400" },
                    { label: "Open tasks", value: "24", tone: "text-sky-400" },
                    { label: "Risk alerts", value: "6", tone: "text-amber-400" },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="text-xs text-slate-500">{k.label}</div>
                      <div className={`mt-1 text-3xl font-bold tracking-tight ${k.tone}`}>
                        {k.value}
                      </div>
                    </div>
                  ))}
                  {/* mini bar chart */}
                  <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Activity className="h-3.5 w-3.5 text-indigo-400" />
                      Compliance trend
                    </div>
                    <div className="mt-4 flex items-end gap-2 h-24">
                      {[52, 61, 58, 70, 74, 82, 79, 87].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-indigo-600/40 to-sky-400/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* risk feed */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="h-4 w-4 text-amber-400" />
                    Risk Alerts
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { t: "License expiring — Austin #14", c: "bg-amber-400" },
                      { t: "Health permit overdue — Reno #7", c: "bg-rose-400" },
                      { t: "Audit due in 3 days — Tampa #22", c: "bg-amber-400" },
                      { t: "Task overdue — Boise #3", c: "bg-rose-400" },
                    ].map((a) => (
                      <div key={a.t} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.c}`} />
                        {a.t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Demo video */}
        <Section id="demo" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
              <Play className="h-3.5 w-3.5 text-indigo-400" />
              90-second product tour
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5">
              See FranchiseIntelligenceOS in motion
            </h2>
            <p className="text-slate-400 mt-4">
              From dashboard to AI assistant to expansion planning — the whole
              platform in a narrated walkthrough.
            </p>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-3 md:p-4 shadow-2xl shadow-indigo-950/40">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
              {(!demoLoaded || showIntro) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
                  {showIntro ? (
                    <button
                      onClick={() => setShowIntro(true)}
                      className="flex flex-col items-center gap-3 text-slate-300 hover:text-white transition-colors"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/15">
                        <Play className="h-7 w-7 translate-x-0.5" />
                      </span>
                      <span className="text-sm">Watch the tour</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                      Loading demo…
                    </div>
                  )}
                </div>
              )}
              {!showIntro && (
                <iframe
                  src="/demo/"
                  title="FranchiseIntelligenceOS product demo"
                  className="absolute inset-0 h-full w-full"
                  onLoad={() => setDemoLoaded(true)}
                  allow="autoplay; fullscreen"
                />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Tip: use the controls to play/pause, jump between chapters, or unmute the narration.
            </p>
          </div>
        </Section>

        {/* Modules */}
        <Section id="modules" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Six modules. One source of truth.
            </h2>
            <p className="text-slate-400 mt-4">
              Everything a multi-unit operator needs to run a compliant, growing
              portfolio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-white/[0.06]"
              >
                <div className="inline-flex rounded-xl border border-white/10 bg-indigo-500/10 p-3 transition-colors group-hover:bg-indigo-500/20">
                  <f.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold mt-4 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* AI assistant preview */}
        <Section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
                <Bot className="h-3.5 w-3.5 text-indigo-400" />
                Franchise Brain
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5">
                Ask your portfolio anything
              </h2>
              <p className="text-slate-400 mt-4 leading-relaxed">
                The built-in AI analyst is grounded in your live data. It reasons
                across locations, licenses, compliance checks, and tasks — and every
                answer is cited back to the exact record.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Natural-language questions, instant answers",
                  "Inline citations to real portfolio records",
                  "Multi-conversation history, scoped to you",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* chat mockup */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 shadow-2xl shadow-indigo-950/40">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-sm">
                    Which locations are at compliance risk?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 leading-relaxed">
                    Three locations are below an 80 compliance score: Reno #7, Boise
                    #3, and Tampa #22. Reno #7 has an overdue health permit driving
                    its score down.
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {["Location #7", "Location #3", "Location #22"].map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-1 text-slate-500">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section id="customers" className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for operators who can't afford surprises
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left"
              >
                <Quote className="h-6 w-6 text-indigo-400/70" />
                <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="mt-6">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/25 via-slate-950 to-sky-600/15 px-8 py-16 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Run your franchise like a Fortune 500
              </h2>
              <p className="text-slate-300 mt-4 max-w-xl mx-auto">
                Bring every location, license, and compliance signal into one
                intelligent command center.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-slate-950 hover:bg-slate-200 px-8 group"
                  >
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="" className="h-8 w-auto" />
              <span className="font-semibold tracking-tight">
                FranchiseIntelligence<span className="text-blue-400">OS</span>
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#platform" className="hover:text-white transition-colors">
                Platform
              </a>
              <a href="#demo" className="hover:text-white transition-colors">
                Demo
              </a>
              <a href="#modules" className="hover:text-white transition-colors">
                Modules
              </a>
              <Link href="/sign-in" className="hover:text-white transition-colors">
                Sign in
              </Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
            FranchiseIntelligenceOS — Intelligence. Compliance. Growth.
          </div>
        </div>
      </footer>
    </div>
  );
}
