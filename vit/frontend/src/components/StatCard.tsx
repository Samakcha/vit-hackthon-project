import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtext?: string;
    trend?: "up" | "down" | "neutral" | "warning" | "success" | "error";
}

export default function StatCard({ title, value, icon: Icon, subtext, trend }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.05] active:scale-95">
            {/* Background Accent */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>

            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-transform group-hover:rotate-12">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                {subtext && (
                    <div className="flex items-center gap-2 mt-1">
                        <p
                            className={clsx(
                                "text-sm font-bold px-2 py-0.5 rounded-full",
                                (trend === "up" || trend === "success") && "bg-emerald-100 text-emerald-600",
                                (trend === "down" || trend === "error") && "bg-rose-100 text-rose-600",
                                trend === "warning" && "bg-amber-100 text-amber-600",
                                (!trend || trend === "neutral") && "bg-slate-100 text-slate-600"
                            )}
                        >
                            {subtext}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
