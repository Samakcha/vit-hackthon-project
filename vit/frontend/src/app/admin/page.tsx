"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { useToast } from "@/components/ToastProvider";
import { Users, UserPlus, FileText, Activity, AlertTriangle } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
    metrics: {
        totalUsers: number;
        totalDoctors: number;
        totalPatients: number;
        totalAppointments: number;
        cancellationRate: string;
        mostBookedSpecialization: string;
    };
    charts: {
        appointmentsPerDay: any[];
    };
}

function AdminDashboardContent() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const json = await res.json();
                setData(json);
            } catch (error) {
                toast("Error loading admin dashboard data", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();

        // Handle role mismatch message
        if (searchParams.get("message") === "role_mismatch") {
            toast("You are registered as an Admin. Redirecting to your console.", "success");
        }
    }, [toast, searchParams]);

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-10 animate-fade-in relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-primary text-xs font-black uppercase tracking-widest leading-none">
                            Platform Control
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Intelligence <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Command</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-medium max-w-xl">Monitor platform growth, user engagement, and health metrics in real-time.</p>
                    </div>
                </div>

                {isLoading || !data ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-32 rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl animate-pulse shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 animate-slide-up [animation-delay:200ms]">
                            <StatCard
                                title="Total Systems"
                                value={data.metrics.totalUsers}
                                icon={Users}
                                subtext="Registered Users"
                            />
                            <StatCard
                                title="Physicians"
                                value={data.metrics.totalDoctors}
                                icon={UserPlus}
                                subtext="Medical Staff"
                            />
                            <StatCard
                                title="Patients"
                                value={data.metrics.totalPatients}
                                icon={Users}
                                subtext="Active Profiles"
                            />
                            <StatCard
                                title="Bookings"
                                value={data.metrics.totalAppointments}
                                icon={FileText}
                                subtext="Life-to-date"
                            />
                            <StatCard
                                title="Churn Rate"
                                value={data.metrics.cancellationRate}
                                icon={AlertTriangle}
                                trend={parseFloat(data.metrics.cancellationRate) > 15 ? "error" : "success"}
                                subtext="Cancellation stats"
                            />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2 animate-slide-up [animation-delay:400ms]">
                            <div className="lg:col-span-2 rounded-[40px] border border-white/40 bg-white/40 p-8 shadow-2xl backdrop-blur-3xl hover:shadow-primary/5 transition-all">
                                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Appointment Velocity</h3>
                                <div className="h-[350px] w-full">
                                    {data.charts.appointmentsPerDay.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.charts.appointmentsPerDay}>
                                                <defs>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                                                    dy={15}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                                                    dx={-15}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '24px',
                                                        border: '1px solid rgba(255,255,255,0.6)',
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        backdropFilter: 'blur(12px)',
                                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                        padding: '12px 16px'
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="appointments"
                                                    stroke="#2563EB"
                                                    strokeWidth={4}
                                                    dot={{ r: 6, fill: '#2563EB', strokeWidth: 0 }}
                                                    activeDot={{ r: 8, fill: '#0EA5E9', strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-slate-400 font-bold italic">
                                            Awaiting platform data...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[40px] border border-white/40 bg-linear-to-br from-primary to-blue-700 p-10 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden relative group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-white/20 transition-all"></div>

                                <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-white/20 backdrop-blur-md text-white mb-8 border border-white/20 shadow-xl transition-all group-hover:scale-110">
                                    <Activity className="h-12 w-12" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Top Specialization</h3>
                                <p className="text-blue-100 font-bold mt-2 mb-10 text-sm uppercase tracking-widest">Analytics Lead</p>

                                <div className="w-full rounded-[28px] bg-white/10 border border-white/20 p-6 backdrop-blur-md shadow-inner transition-all group-hover:bg-white/20">
                                    <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                                        {data.metrics.mostBookedSpecialization}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
