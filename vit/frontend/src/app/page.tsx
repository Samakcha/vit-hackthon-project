import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import {
  Stethoscope,
  Calendar,
  Shield,
  Clock,
  Activity,
  ArrowRight,
  Users,
  User,
  CheckCircle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">HealthSync</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Services</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-4">
            <SignedOut>
              <div className="relative group/auth">
                <button
                  className="text-sm font-semibold text-slate-900 group-hover/auth:text-primary transition-colors flex items-center gap-1 cursor-default"
                >
                  Sign In
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 opacity-0 invisible group-hover/auth:opacity-100 group-hover/auth:visible transition-all duration-300 translate-y-2 group-hover/auth:translate-y-0 z-50">
                  <Link
                    href="/sign-in?role=patient"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-primary transition-colors mb-1"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-bold">As Patient</span>
                  </Link>
                  <Link
                    href="/sign-in?role=doctor"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-secondary transition-colors"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-bold">As Doctor</span>
                  </Link>
                </div>
              </div>
              <Link
                href="/sign-up?role=patient"
                className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg md:block hover:scale-[1.05] active:scale-95"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/api/auth/sync-user"
                className="text-sm font-bold text-slate-900 hover:text-primary transition-colors"
              >
                Go to Dashboard
              </Link>
              <div className="h-10 w-10 rounded-full border border-slate-200 p-0.5">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-primary border border-blue-100 mb-8 animate-fade-in [animation-delay:200ms]">
                <span className="text-xs font-bold uppercase tracking-wider">Next-Gen Healthcare Management System</span>
              </div>
              <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 lg:text-7xl animate-fade-in [animation-delay:400ms]">
                Modern Care, <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Smarter Scheduling</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 animate-fade-in [animation-delay:600ms]">
                Experience a seamless healthcare journey. Connect with top medical specialists, manage your health records, and schedule appointments with a few clicks. For doctors and patients alike.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row animate-fade-in [animation-delay:800ms]">
                <Link
                  href="/sign-up?role=patient"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-10 text-lg font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
                >
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-10 text-lg font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Learn More
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <Shield className="h-5 w-5 text-success" /> HIPAA Compliant
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <CheckCircle className="h-5 w-5 text-primary" /> Verified Doctors
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <Users className="h-5 w-5 text-secondary" /> 10k+ Happy Users
                </div>
              </div>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 -right-64 -translate-y-1/2 overflow-hidden blur-3xl opacity-20 pointer-events-none hidden lg:block animate-float">
            <div className="h-96 w-96 rounded-full bg-primary/40 animate-pulse"></div>
          </div>
        </section>

        {/* About & Services Section */}
        <section id="services" className="bg-slate-50 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">Comprehensive Healthcare Services</h2>
              <p className="mt-4 text-slate-500">Everything you need to manage your health in one place.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ServiceCard
                icon={Calendar}
                title="Seamless Booking"
                description="Schedule appointments in seconds with your preferred specialists. Automated reminders keep you updated."
              />
              <ServiceCard
                icon={Stethoscope}
                title="Doctor Management"
                description="A robust dashboard for healthcare professionals to manage their patient flow and consultations."
              />
              <ServiceCard
                icon={Clock}
                title="24/7 Access"
                description="Access your patient records and upcoming schedules any time, anywhere from your dashboard."
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="relative h-[400px] w-full rounded-3xl bg-blue-100 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                    <Activity className="h-64 w-64" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white">
                    <p className="font-bold text-slate-900 italic">"Our mission is to bridge the gap between healthcare providers and patients with cutting-edge technology."</p>
                    <p className="mt-2 text-sm text-slate-500">— HealthSync Team</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">Redefining the <br /><span className="text-primary font-black italic underline decoration-secondary decoration-4 underline-offset-8">Patient Experience</span></h2>
                <p className="text-lg text-slate-600 mb-8">
                  HealthSync simplifies the complex medical landscape. We provide a platform that empowers both patients and doctors through transparency, efficiency, and automated workflows.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-secondary flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-700">Role-based Secure Access Control</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-secondary flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-700">Real-time Appointment Tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-secondary flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-700">Advanced Analytics Dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-900">HealthSync</span>
          </div>
          <div className="text-sm text-slate-400">
            &copy; 2026 HealthSync System Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary">Twitter</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary">LinkedIn</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, description }: any) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-2 hover:border-primary hover:shadow-xl">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
