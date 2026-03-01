"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
    LayoutDashboard,
    CalendarDays,
    User as UserIcon,
    Settings,
    Activity,
    Search,
    ChevronLeft,
    ChevronRight,
    Bot
} from "lucide-react";
import clsx from "clsx";

const patientLinks = [
    { name: "Dashboard", href: "/patient", icon: LayoutDashboard },
    { name: "Find Doctors", href: "/patient/find-doctors", icon: Search },
    { name: "CuraBot", href: "/patient/curabot", icon: Bot },
    { name: "Appointments", href: "/patient/appointments", icon: CalendarDays },
    { name: "Profile", href: "/patient/profile", icon: UserIcon },
];

const doctorLinks = [
    { name: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { name: "Schedule", href: "/doctor/schedule", icon: CalendarDays },
    { name: "Profile", href: "/doctor/profile", icon: UserIcon },
];

const adminLinks = [
    { name: "Analytics", href: "/admin", icon: Activity },
    { name: "Users", href: "/admin/users", icon: UserIcon },
    { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ role, isCollapsed, setIsCollapsed }: { role: "patient" | "doctor" | "admin" | "none"; isCollapsed: boolean; setIsCollapsed: (val: boolean) => void }) {
    const pathname = usePathname();

    let links: any[] = [];
    if (role === "admin") links = adminLinks;
    else if (role === "doctor") links = doctorLinks;
    else if (role === "patient") links = patientLinks;

    return (
        <div className={clsx(
            "hidden lg:flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/20 min-h-screen fixed left-0 top-0 pt-8 shadow-2xl z-40 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-primary transition-colors z-50 cursor-pointer"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <div className={clsx("pb-8 border-b border-slate-100/50 flex flex-col items-center", isCollapsed ? "px-2" : "px-8")}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-white shadow-lg mb-4">
                    <Activity className="h-7 w-7" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">
                            HealthSync
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Portal</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto w-full">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            title={isCollapsed ? link.name : undefined}
                            className={clsx(
                                "flex items-center rounded-2xl text-sm font-bold transition-all duration-300",
                                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                                isActive
                                    ? "bg-linear-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20 scale-105"
                                    : "text-slate-500 hover:bg-white hover:text-primary hover:shadow-md hover:scale-105"
                            )}
                        >
                            <Icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                            {!isCollapsed && <span className="truncate">{link.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className={clsx("p-6 border-t border-slate-100/50 bg-white/30 backdrop-blur-md w-full", isCollapsed ? "flex justify-center px-2" : "")}>
                <div className={clsx("flex items-center gap-4", isCollapsed ? "justify-center" : "")}>
                    <div className="p-1 rounded-full shrink-0 bg-linear-to-tr from-primary/20 to-secondary/20 border border-white">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Authorized</span>
                            <span className="text-sm font-black text-slate-900 capitalize tracking-tight">{role}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
