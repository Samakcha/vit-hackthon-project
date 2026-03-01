import { Bell, Menu, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/20 bg-white/40 px-8 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-6">
                {/* Mobile menu trigger */}
                <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-primary transition-all hover:scale-110 active:scale-95">
                    <Menu className="h-6 w-6" />
                </button>

                <div className="hidden md:flex relative w-80 items-center h-12 rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-500 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
                    <Search className="mr-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 font-medium text-slate-700"
                        placeholder="Search for patients, reports or schedules..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative group p-2.5 rounded-2xl bg-white/50 border border-white/40 text-slate-500 hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-error border-2 border-white ring-2 ring-error/20 animate-pulse"></span>
                </button>

                <div className="h-10 w-px bg-slate-200/50 hidden sm:block"></div>

                <div className="lg:hidden p-1 rounded-full bg-linear-to-tr from-primary/10 to-secondary/10 border border-white shadow-sm">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    );
}
