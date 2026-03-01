"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { CalendarDays, Clock, Activity, User, Check } from "lucide-react";

function MetricItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
            <p className="text-slate-900 font-black text-lg">{value}</p>
        </div>
    );
}

function PatientDashboardContent() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [modalState, setModalState] = useState<{ isOpen: boolean; id: string | null; action: "confirm" | "cancel" | null }>({
        isOpen: false,
        id: null,
        action: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            const [appRes, profRes] = await Promise.all([
                fetch("/api/appointments"),
                fetch("/api/patient")
            ]);
            if (!appRes.ok || !profRes.ok) throw new Error("Failed to fetch data");
            const appData = await appRes.json();
            const profData = await profRes.json();
            setAppointments(appData);
            setProfile(profData.profile);
        } catch (error) {
            toast("Error loading data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Handle role mismatch message
        if (searchParams.get("message") === "role_mismatch") {
            toast("You are already registered as a Patient. Redirecting you to your hub.", "success");
        }
    }, [searchParams]);

    const isProfileIncomplete = !profile || !profile.phone || !profile.sex;

    useEffect(() => {
        if (!isLoading && isProfileIncomplete) {
            router.replace("/patient/profile?onboarding=true");
        }
    }, [isLoading, isProfileIncomplete, router]);

    const handleActionClick = (id: string, action: "confirm" | "cancel") => {
        setModalState({ isOpen: true, id, action });
    };

    const executeAction = async () => {
        if (!modalState.id || !modalState.action) return;

        setIsActionLoading(true);
        try {
            const res = await fetch("/api/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: modalState.id, action: modalState.action })
            });

            if (!res.ok) throw new Error("Failed to update appointment");

            toast(`Appointment ${modalState.action}ed successfully`, "success");
            fetchData();
        } catch (error) {
            toast(`Error: Could not ${modalState.action} appointment`, "error");
        } finally {
            setIsActionLoading(false);
            setModalState({ isOpen: false, id: null, action: null });
        }
    };

    const upcomingCount = appointments.filter(a =>
        ["pending", "accepted_by_doctor", "confirmed"].includes(a.status) && new Date(a.appointmentDate) >= new Date()
    ).length;

    const requiresActionCount = appointments.filter(a => a.status === "accepted_by_doctor").length;

    return (
        <DashboardLayout role="patient">
            <div className="flex flex-col gap-10 animate-fade-in relative z-10">
                {/* Profile Completion Alert */}
                {isProfileIncomplete && !isLoading && (
                    <div className="p-8 rounded-[40px] bg-linear-to-r from-primary/10 to-secondary/10 border border-white/60 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-primary/20 transition-all"></div>
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-3xl bg-white/80 flex items-center justify-center border border-white shadow-xl group-hover:scale-110 transition-transform">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">Complete Your Health Profile</h4>
                                <p className="text-slate-500 font-medium">Add your medical history and caretaker details for a better experience.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/patient/profile")}
                            className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                        >
                            <Check className="h-5 w-5" />
                            Complete Setup
                        </button>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest leading-none">
                            Patient Portal
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Your <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Health Hub</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-medium max-w-xl">Welcome back. Manage your consultations, records, and upcoming care.</p>
                    </div>
                    <button
                        onClick={() => router.push("/patient/find-doctors")}
                        className="h-14 px-8 rounded-2xl bg-linear-to-r from-primary to-blue-600 text-white font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <CalendarDays className="h-5 w-5" />
                        Book Appointment
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up [animation-delay:200ms]">
                    <StatCard
                        title="Upcoming Visits"
                        value={upcomingCount}
                        icon={CalendarDays}
                        subtext={upcomingCount > 0 ? `${upcomingCount} scheduled` : "No visits"}
                        trend="neutral"
                    />
                    <StatCard
                        title="Requires Action"
                        value={requiresActionCount}
                        icon={Clock}
                        trend={requiresActionCount > 0 ? "error" : "neutral"}
                        subtext={requiresActionCount > 0 ? "Confirm now" : "All set"}
                    />
                    <StatCard
                        title="Past Visits"
                        value={appointments.length - upcomingCount}
                        icon={Activity}
                        subtext="Completion history"
                    />
                </div>

                {/* Main Content Area */}
                <div className="animate-slide-up [animation-delay:400ms]">
                    <div className="flex items-center justify-between mb-8 group/header">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 rounded-full bg-linear-to-b from-primary to-secondary transition-all group-hover/header:h-12"></div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Active Schedule</h3>
                        </div>
                        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm">
                            <span className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 cursor-pointer transition-all">All</span>
                            <span className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 cursor-pointer hover:bg-white hover:text-primary transition-all">Pending</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Active Schedule */}
                        <div className="xl:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-64 rounded-[32px] border border-white/40 bg-white/40 backdrop-blur-xl animate-pulse shadow-sm"></div>
                                    ))
                                ) : appointments.length === 0 ? (
                                    <div className="col-span-full rounded-[48px] border-4 border-dashed border-white/40 bg-white/30 p-24 text-center backdrop-blur-md shadow-2xl">
                                        <div className="mx-auto h-24 w-24 rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-8 shadow-inner">
                                            <CalendarDays className="h-12 w-12 text-slate-400" />
                                        </div>
                                        <h4 className="text-3xl font-black text-slate-900 mb-3">Your calendar is open</h4>
                                        <p className="text-slate-500 text-lg font-medium max-w-md mx-auto mb-10">Take control of your health. Schedule your first appointment with a specialist today.</p>
                                        <button className="px-10 py-5 rounded-[24px] bg-linear-to-r from-primary to-secondary text-white font-black shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all inline-flex items-center gap-3">
                                            Browse Doctors
                                        </button>
                                    </div>
                                ) : (
                                    appointments.map(app => (
                                        <AppointmentCard
                                            key={app._id}
                                            id={app._id}
                                            doctorName={app.doctorName}
                                            specialization={app.specialization}
                                            date={app.appointmentDate}
                                            status={app.status}
                                            role="patient"
                                            onAction={(id, action) => handleActionClick(id, action as "confirm" | "cancel")}
                                            isLoading={isActionLoading && modalState.id === app._id}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Health Snapshot Side Panel */}
                        <div className="space-y-8">
                            <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Activity className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Snapshot</h3>
                                    </div>
                                    <button
                                        onClick={() => router.push("/patient/profile")}
                                        className="text-xs font-black text-primary hover:underline uppercase tracking-widest transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <MetricItem label="Blood Type" value={profile?.bloodGroup || "—"} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <MetricItem label="Height" value={profile?.height ? `${profile.height} cm` : "—"} />
                                        <MetricItem label="Weight" value={profile?.weight ? `${profile.weight} kg` : "—"} />
                                    </div>
                                    <div className="pt-4 border-t border-slate-100/50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Caretaker</label>
                                        <p className="text-slate-900 font-bold mt-1">{profile?.caretakerName || "Not assigned"}</p>
                                        <p className="text-slate-500 text-sm font-medium">{profile?.caretakerPhone || "—"}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100/50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical History</label>
                                        <p className="text-slate-500 text-sm font-medium mt-2 line-clamp-3">
                                            {profile?.medicalHistory || "No history available."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalState.isOpen}
                title={modalState.action === "cancel" ? "Cancel Appointment" : "Confirm Appointment"}
                description={modalState.action === "cancel"
                    ? "Are you sure you want to cancel this appointment? This action cannot be undone."
                    : "Please confirm that you will attend this appointment."}
                confirmText={modalState.action === "cancel" ? "Yes, Cancel it" : "Yes, Confirm"}
                onConfirm={executeAction}
                onCancel={() => setModalState({ isOpen: false, id: null, action: null })}
                isLoading={isActionLoading}
            />
        </DashboardLayout>
    );
}

export default function PatientDashboard() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <PatientDashboardContent />
        </Suspense>
    );
}
