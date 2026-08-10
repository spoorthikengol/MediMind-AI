import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  ShieldCheck,
  Sparkles,
  Upload,
  LineChart,
  MessageCircle,
  CheckCircle2,
  Star,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AuroraBg } from "@/components/aurora-bg";
import { HeartbeatLine } from "@/components/heartbeat-line";


import { ProgressRing } from "@/components/progress-ring";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <AuroraBg />
      {/* Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${
          scrolled ? "backdrop-blur-xl bg-background/60 border-b border-white/5" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#benefits" className="hover:text-foreground transition">Benefits</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
            <Button asChild size="sm" className="btn-glow text-white border-0 hover:brightness-110">
              <Link to="/register">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col gap-1 p-4">
              <a href="#features" className="py-2 text-sm">Features</a>
              <a href="#how" className="py-2 text-sm">How it works</a>
              <a href="#benefits" className="py-2 text-sm">Benefits</a>
              <a href="#faq" className="py-2 text-sm">FAQ</a>
              <Button asChild variant="outline" size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm" className="gradient-brand text-white border-0"><Link to="/register">Get Started</Link></Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="hidden lg:block absolute left-4 top-40 h-[420px] w-[160px] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 70%)" }} />
        <div className="hidden lg:block absolute right-4 top-56 h-[420px] w-[160px] rounded-full blur-3xl opacity-45"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.40) 0%, transparent 70%)" }} />
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-tech-cyan" />
            <span className="text-gradient font-semibold">Powered by advanced healthcare AI</span>
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tighter">
            AI-Powered Healthcare, <br className="hidden md:block" />
            <span className="text-gradient">Built Around You.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload your medical reports. Receive intelligent AI analysis. Track your health over time. Chat with your personal AI healthcare assistant.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="btn-glow animate-glow text-white border-0 h-12 px-6 hover:brightness-110">
              <Link to="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/15 bg-white/5 backdrop-blur hover:bg-white/10">
              <Link to="/login">Watch Demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">HIPAA-ready · No credit card · Cancel anytime</p>

          {/* Hero illustration */}
          <div className="mt-16 relative mx-auto max-w-5xl animate-float">
            <div className="absolute inset-0 gradient-hero opacity-40 blur-3xl rounded-[3rem]" />
            <div className="relative glass-strong rounded-[2rem] p-4 shadow-glow gradient-border">
              <div className="relative rounded-2xl gradient-hero p-6 md:p-10 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />
                <HeartbeatLine className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 w-full opacity-70" />
                <div className="relative grid gap-5 md:grid-cols-4 items-stretch">
                  <div className="rounded-2xl bg-white/15 backdrop-blur-lg p-5 text-left flex flex-col items-center justify-center row-span-2 md:col-span-1">
                    <ProgressRing value={86} size={130} stroke={11} sublabel="Health Score" from="#ffffff" to="#c4b5fd" />
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-lg p-5 text-left">
                    <LineChart className="h-5 w-5 mb-2 opacity-90" />
                    <div className="text-2xl font-semibold">+18%</div>
                    <div className="text-xs opacity-80 mt-1">Improvement · YoY</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-lg p-5 text-left">
                    <ShieldCheck className="h-5 w-5 mb-2 opacity-90" />
                    <div className="text-2xl font-semibold">Low</div>
                    <div className="text-xs opacity-80 mt-1">Overall risk</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-lg p-5 text-left">
                    <Activity className="h-5 w-5 mb-2 opacity-90" />
                    <div className="text-2xl font-semibold">12</div>
                    <div className="text-xs opacity-80 mt-1">Markers tracked</div>
                  </div>
                  <div className="rounded-2xl bg-white/15 backdrop-blur-lg p-5 text-left md:col-span-2">
                    <MessageCircle className="h-5 w-5 mb-2 opacity-90" />
                    <div className="text-sm font-medium">"Your cholesterol dropped 26% since last visit — great work!"</div>
                    <div className="text-xs opacity-80 mt-1">AI Medical Assistant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">Features</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Everything your health deserves.</h2>
            <p className="mt-4 text-muted-foreground">Purpose-built AI, thoughtfully designed. Every feature is here to help you live better.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const tones = [
                "from-brand to-ai-purple",
                "from-ai-purple to-tech-cyan",
                "from-tech-cyan to-health-green",
                "from-health-green to-brand",
                "from-brand to-tech-cyan",
                "from-ai-purple to-brand",
              ];
              return (
                <div key={f.title} className="group relative rounded-3xl glass p-6 shadow-card hover:shadow-glow transition-all hover:-translate-y-1 overflow-hidden">
                  <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-2xl bg-gradient-to-br from-brand to-ai-purple group-hover:opacity-40 transition" />
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[i % tones.length]} text-white shadow-soft`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">How it works</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Three steps to clarity.</h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative glass rounded-3xl p-8">
                <div className="text-6xl font-display font-semibold text-gradient opacity-90">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">Why MediMind</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Built to help you take control.</h2>
            <p className="mt-4 text-muted-foreground">We combine medical-grade AI with a refined interface so anyone — not just doctors — can understand their health.</p>
            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 gradient-hero opacity-40 blur-3xl rounded-[3rem]" />
            <div className="relative glass-strong rounded-3xl p-6 shadow-glow">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Latest Insight</div>
                    <div className="mt-1 font-semibold">Cholesterol trending down</div>
                  </div>
                  <div className="rounded-full bg-success/15 text-success text-xs font-medium px-3 py-1">−26%</div>
                </div>
                <div className="mt-5 h-40 rounded-xl gradient-hero relative overflow-hidden">
                  <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full">
                    <path d="M0 120 Q 60 90 100 100 T 200 70 T 300 50 T 400 30" stroke="white" strokeWidth="3" fill="none" />
                    <path d="M0 120 Q 60 90 100 100 T 200 70 T 300 50 T 400 30 L 400 160 L 0 160 Z" fill="white" fillOpacity="0.15" />
                  </svg>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {["Sep", "Jan", "Jul"].map((m, i) => (
                    <div key={m} className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="text-xs text-muted-foreground">{m}</div>
                      <div className="font-semibold text-gradient">{[134, 128, 98][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">Loved by users</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">A calmer way to care for yourself.</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-3xl glass p-6 shadow-card">
                <div className="flex gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-white font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">FAQ</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Questions, answered.</h2>
          </div>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-12 md:p-16 text-white text-center shadow-glow animate-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight relative">Start understanding your health today.</h2>
            <p className="mt-4 text-white/80 relative">Free to try. Your reports stay private.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 relative">
              <Button asChild size="lg" className="bg-white text-navy hover:bg-white/90 h-12 px-6 font-semibold">
                <Link to="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">Your personal AI health companion. Not a substitute for professional medical advice.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link to="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} MediMind AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Upload, title: "Instant Report Analysis", desc: "Upload any medical PDF and get a clear, human summary in seconds." },
  { icon: Brain, title: "AI Medical Assistant", desc: "Ask questions about your reports and get thoughtful, evidence-based answers." },
  { icon: LineChart, title: "Health Trends", desc: "Beautiful charts show how your markers change over time." },
  { icon: ShieldCheck, title: "Private & Secure", desc: "End-to-end encryption. Your data is yours — always." },
  { icon: Activity, title: "Health Score", desc: "One elegant number captures your overall wellbeing at a glance." },
  { icon: MessageCircle, title: "Report Comparison", desc: "See exactly what improved — and what needs attention." },
];

const steps = [
  { title: "Upload your report", desc: "Drag any PDF from your last checkup, blood work, or scan." },
  { title: "AI analyzes instantly", desc: "Our medical AI extracts every marker and explains it plainly." },
  { title: "Track & ask anything", desc: "Watch your trends, compare reports, and chat with your assistant." },
];

const benefits = [
  "Understand medical jargon in plain English",
  "Track improvements year over year",
  "Get personalized wellness suggestions",
  "Share summaries with your doctor",
  "Private, encrypted, and yours forever",
];

const testimonials = [
  { name: "Sarah Chen", role: "Product Designer", quote: "I finally understand my blood work. The trend charts alone are worth it." },
  { name: "Marcus Ali", role: "Marathon Runner", quote: "I use it before every checkup. My doctor asked what app I was using." },
  { name: "Priya Sharma", role: "Working Parent", quote: "Uploading a report and getting a real answer in seconds feels like magic." },
];

const faqs = [
  { q: "Is MediMind AI a replacement for my doctor?", a: "No. MediMind AI helps you understand your health data, but always consult a qualified professional for medical decisions." },
  { q: "How is my data protected?", a: "All reports are encrypted at rest and in transit. You can delete your data at any time." },
  { q: "What files can I upload?", a: "Most PDF-based medical reports, blood work, and lab results are supported." },
  { q: "How accurate is the AI?", a: "Our models are trained on peer-reviewed medical literature and refined by clinicians, but should never replace professional judgment." },
];
