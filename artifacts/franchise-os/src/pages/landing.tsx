import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Bot, MapPin, CheckSquare, FileText } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const features = [
  {
    icon: MapPin,
    title: "Location Intelligence",
    desc: "Every location, license, and audit in one command center.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Scoring",
    desc: "Real-time 0–100 scoring with automatic remediation tasks.",
  },
  {
    icon: Bot,
    title: "Franchise Brain",
    desc: "An AI assistant grounded in your live portfolio data, with citations.",
  },
  {
    icon: TrendingUp,
    title: "Expansion Readiness",
    desc: "Know exactly which states are ready for your next unit.",
  },
  {
    icon: CheckSquare,
    title: "Task Automation",
    desc: "Failed checks become prioritized tasks — automatically.",
  },
  {
    icon: FileText,
    title: "Document Hub",
    desc: "SOPs, policies, and agreements — searchable and centralized.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="" className="h-10 w-auto" />
          <span className="font-semibold text-lg tracking-tight">
            FranchiseIntelligence<span className="text-blue-400">OS</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="text-center pt-20 pb-16">
          <img src={logoIcon} alt="" className="h-24 w-auto mx-auto mb-8" />
          <p className="text-[11px] tracking-[0.35em] text-slate-400 uppercase mb-4">
            Intelligence. Compliance. Growth.
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            The operating system for elite franchise portfolios
          </h1>
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            Track every location, score compliance in real time, and ask your AI
            analyst anything about your portfolio — all in one executive command center.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8">
                Get started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left"
            >
              <f.icon className="w-6 h-6 text-indigo-400 mb-4" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-500">
        FranchiseIntelligenceOS — Intelligence. Compliance. Growth.
      </footer>
    </div>
  );
}
