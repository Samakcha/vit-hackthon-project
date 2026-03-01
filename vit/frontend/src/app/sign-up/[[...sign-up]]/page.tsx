"use client";

import { SignUp } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get("role");

    return (
        <div className="flex min-h-screen items-center justify-center bg-mesh relative overflow-hidden p-6">
            {/* Background Blobs */}
            <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-md">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-linear-to-br from-primary to-secondary text-white shadow-2xl shadow-primary/30">
                        <Activity className="h-12 w-12" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2 underline decoration-primary/20 underline-offset-8">HealthSync</h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Healthcare Management System</p>
                    </div>
                </div>

                <div className="w-full rounded-[48px] border border-white/60 bg-white/40 p-1 backdrop-blur-3xl shadow-[0_32px_128px_-32px_rgba(0,0,0,0.12)]">
                    <SignUp
                        fallbackRedirectUrl={`/api/auth/sync-user${role ? `?role=${role}` : ""}`}
                        appearance={{
                            elements: {
                                card: "bg-transparent shadow-none border-none p-4 sm:p-8",
                                headerTitle: "text-3xl font-black text-slate-900 tracking-tight",
                                headerSubtitle: "text-slate-500 font-bold",
                                socialButtonsBlockButton: "rounded-2xl border-white/60 bg-white/40 backdrop-blur-xl hover:bg-white transition-all shadow-sm h-12 flex items-center justify-center",
                                formButtonPrimary: "rounded-2xl bg-linear-to-r from-primary to-blue-600 text-sm font-black shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all h-14",
                                formFieldInput: "rounded-2xl border-white/40 bg-white/40 backdrop-blur-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 h-12 transition-all",
                                footerActionLink: "text-primary font-black hover:text-blue-700",
                                dividerLine: "bg-slate-200/50",
                                dividerText: "text-slate-400 font-black uppercase text-[10px] tracking-widest",
                                formFieldLabel: "text-slate-500 font-black text-xs uppercase tracking-widest mb-2 px-1",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}
