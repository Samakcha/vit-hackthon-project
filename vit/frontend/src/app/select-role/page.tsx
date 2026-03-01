"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Stethoscope, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import clsx from "clsx";

export default function SelectRolePage() {
    const [selected, setSelected] = useState<"patient" | "doctor" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleConfirm = async () => {
        if (!selected) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: selected }),
            });

            if (res.ok) {
                toast(`Welcome! Redirecting to your ${selected} dashboard...`, "success");
                router.push(selected === "patient" ? "/patient" : "/doctor");
            } else {
                throw new Error("Failed to set role");
            }
        } catch (error) {
            toast("Error setting role. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
                    Choose Your Path
                </h1>
                <p className="text-lg text-slate-600">
                    Tell us how you'll be using the platform so we can tailor your experience.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Patient Option */}
                <button
                    onClick={() => setSelected("patient")}
                    className={clsx(
                        "group relative flex flex-col items-center p-10 rounded-3xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-xl",
                        selected === "patient"
                            ? "border-primary ring-4 ring-primary/10 scale-[1.02]"
                            : "border-slate-100 hover:border-slate-300"
                    )}
                >
                    <div className={clsx(
                        "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                        selected === "patient" ? "bg-primary text-white" : "bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                        <User className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">I'm a Patient</h3>
                    <p className="text-slate-500 text-center">
                        Book appointments, track medical history, and connect with specialists.
                    </p>
                    {selected === "patient" && (
                        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    )}
                </button>

                {/* Doctor Option */}
                <button
                    onClick={() => setSelected("doctor")}
                    className={clsx(
                        "group relative flex flex-col items-center p-10 rounded-3xl border-2 transition-all duration-300 bg-white shadow-sm hover:shadow-xl",
                        selected === "doctor"
                            ? "border-secondary ring-4 ring-secondary/10 scale-[1.02]"
                            : "border-slate-100 hover:border-slate-300"
                    )}
                >
                    <div className={clsx(
                        "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                        selected === "doctor" ? "bg-secondary text-white" : "bg-emerald-50 text-secondary group-hover:bg-secondary group-hover:text-white"
                    )}>
                        <Stethoscope className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">I'm a Doctor</h3>
                    <p className="text-slate-500 text-center">
                        Manage your practice, accept patient requests, and track consultations.
                    </p>
                    {selected === "doctor" && (
                        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-white">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    )}
                </button>
            </div>

            <button
                disabled={!selected || isLoading}
                onClick={handleConfirm}
                className={clsx(
                    "mt-16 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                    selected === "patient" ? "bg-primary text-white hover:bg-blue-700" :
                        selected === "doctor" ? "bg-secondary text-white hover:bg-emerald-700" :
                            "bg-slate-200 text-slate-400"
                )}
            >
                {isLoading ? "Setting up your account..." : "Continue to Dashboard"}
            </button>
        </div>
    );
}
