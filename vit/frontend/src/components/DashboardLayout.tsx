"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children, role }: { children: ReactNode; role: "patient" | "doctor" | "admin" | "none" }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans bg-mesh overflow-hidden">
            <Sidebar role={role} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className={`flex-1 flex flex-col relative w-full h-screen overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Navbar />
                <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-7xl mx-auto scroll-smooth">
                    {children}
                </main>
            </div>

            {/* Background Decorative Blobs */}
            <div className="fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
            <div className="fixed -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>
        </div>
    );
}
