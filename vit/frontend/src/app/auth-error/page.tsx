"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const existing = searchParams.get("existing");

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 text-slate-900 font-sans">
            <div className="max-w-xl w-full bg-white/40 backdrop-blur-3xl rounded-[48px] border border-white/60 p-12 shadow-2xl relative overflow-hidden animate-fade-in group">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 h-64 w-64 bg-red-400/10 blur-3xl -mr-32 -mt-32 rounded-full transition-all group-hover:bg-red-400/20"></div>
                <div className="absolute bottom-0 left-0 h-48 w-48 bg-blue-400/10 blur-3xl -ml-24 -mb-24 rounded-full"></div>

                <div className="relative z-10 text-center">
                    <div className="h-24 w-24 bg-red-100/50 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-200 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                        Access <span className="bg-clip-text text-transparent bg-linear-to-r from-red-500 to-orange-500">Restricted</span>
                    </h1>

                    {type === "role_mismatch" ? (
                        <div className="space-y-6">
                            <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                Our system has detected that this account is already registered as a <span className="text-slate-900 font-black capitalize">{existing}</span>.
                            </p>
                            <p className="text-slate-400 text-sm font-bold bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
                                To protect platform integrity, an account cannot hold multiple professional roles simultaneously.
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-lg font-medium">
                            An authentication error occurred while processing your request.
                        </p>
                    )}

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Return Home
                        </Link>

                        <SignOutButton>
                            <button className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95">
                                <LogOut className="h-5 w-5" />
                                Switch Account
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-mesh flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
