"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { Users, Clock, CheckCircle } from "lucide-react";

function DoctorDashboardContent() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [modalState, setModalState] = useState<{ isOpen: boolean; id: string | null; action: "accept" | "cancel" | null }>({
        isOpen: false,
        id: null,
        action: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { toast } = useToast();

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            if (!res.ok) throw new Error("Failed to fetch appointments");
            const data = await res.json();
            setAppointments(data);
        } catch (error) {
            toast("Error loading schedule", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctorInfo = async () => {
        try {
            const res = await fetch("/api/doctor");
            if (!res.ok) throw new Error("Failed to fetch doctor info");
            const data = await res.json();
            setIsVerified(data.user.isVerified);
            setProfile(data.profile);
        } catch (error) {
            console.error("Error fetching doctor info:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchAppointments(), fetchDoctorInfo()]);
        };
        init();

        // Handle role mismatch message
        if (searchParams.get("message") === "role_mismatch") {
            toast("You are already registered as a Doctor. Redirecting you to your console.", "success");
        }
    }, [searchParams]);

    const isProfileIncomplete = !profile || !profile.phone || !profile.specialization;

    useEffect(() => {
        if (!isLoading && profile && isProfileIncomplete) {
            router.replace("/doctor/profile?onboarding=true");
        }
    }, [isLoading, profile, isProfileIncomplete, router]);

    const handleActionClick = (id: string, action: "accept" | "cancel") => {
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
            fetchAppointments();
        } catch (error) {
            toast(`Error: Could not ${modalState.action} appointment`, "error");
        } finally {
            setIsActionLoading(false);
            setModalState({ isOpen: false, id: null, action: null });
        }
    };

    const [activeTab, setActiveTab] = useState<"today" | "pending">("today");

    const pendingRequests = appointments.filter(a => a.status === "pending").length;
    const todayAppointments = appointments.filter(a => {
        const appDate = new Date(a.appointmentDate);
        const today = new Date();
        return (a.status === "confirmed" || a.status === "accepted_by_doctor") &&
            appDate.getDate() === today.getDate() &&
            appDate.getMonth() === today.getMonth() &&
            appDate.getFullYear() === today.getFullYear();
    }).length;

    const completedStats = appointments.filter(a =>
        (a.status === "confirmed" || a.status === "accepted_by_doctor") && new Date(a.appointmentDate) < new Date()
    ).length;

    const displayedAppointments = appointments.filter(a => {
        if (activeTab === "pending") return a.status === "pending";
        const appDate = new Date(a.appointmentDate);
        const today = new Date();
        return (a.status === "confirmed" || a.status === "accepted_by_doctor") &&
            appDate.getDate() === today.getDate() &&
            appDate.getMonth() === today.getMonth() &&
            appDate.getFullYear() === today.getFullYear();
    });

    return (
        <DashboardLayout role="doctor">
            <div className="flex flex-col gap-10 animate-fade-in relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-black uppercase tracking-widest leading-none">
                            Physician Console
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Medical <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-500 to-teal-600">Command Center</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-xl">Monitor your daily schedule, patient requests, and clinical metrics.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/doctor/schedule")}
                            className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            View History
                        </button>
                        <button
                            onClick={() => router.push("/doctor/profile")}
                            className="h-14 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-black shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Clock className="h-5 w-5" />
                            Update Availability
                        </button>
                    </div>
                </div>

                {/* Verification Banner */}
                {!isVerified && (
                    <div className="p-8 rounded-[32px] bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 backdrop-blur-xl animate-pulse-subtle flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-amber-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-400/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                        <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-inner group-hover:scale-110 transition-transform">
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Credentials Verification Pending</h4>
                            <p className="text-slate-500 font-medium mt-1">Your account is currently under review by our medical board. This usually takes 24-48 hours. Most features will be unlocked once verified.</p>
                        </div>
                        <button className="px-6 py-3 rounded-xl bg-amber-600 text-white font-black text-sm shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all">
                            Verify Identity
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up [animation-delay:200ms]">
                    <div onClick={() => setActiveTab("pending")} className="cursor-pointer group">
                        <StatCard
                            title="Pending Requests"
                            value={pendingRequests}
                            icon={Clock}
                            subtext={pendingRequests > 0 ? "Requires Review" : "All Clear"}
                            trend={pendingRequests > 0 ? "error" : "success"}
                        />
                    </div>
                    <div onClick={() => setActiveTab("today")} className="cursor-pointer">
                        <StatCard
                            title="Today's Schedule"
                            value={todayAppointments}
                            icon={Users}
                            subtext="Confirmed patients"
                            trend="neutral"
                        />
                    </div>
                    <StatCard
                        title="Total Consultations"
                        value={completedStats}
                        icon={CheckCircle}
                        subtext="All-time stats"
                        trend="up"
                    />
                </div>

                {/* Main Content Area */}
                <div className="animate-slide-up [animation-delay:400ms]">
                    <div className="flex items-center justify-between mb-8 group/header">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 rounded-full bg-linear-to-b from-emerald-500 to-teal-600 transition-all group-hover/header:h-12"></div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Incoming & Active</h3>
                        </div>
                        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm">
                            <button
                                onClick={() => setActiveTab("today")}
                                className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === "today" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:bg-white hover:text-emerald-600"}`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={`px-5 py-2 rounded-xl text-sm font-black transition-all ${activeTab === "pending" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:bg-white hover:text-emerald-600"}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-48 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"></div>
                            ))
                        ) : displayedAppointments.length === 0 ? (
                            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                                <Users className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                                <h4 className="text-sm font-medium text-slate-900 mb-1 italic">Silent <span className="text-emerald-600">Corridors</span></h4>
                                <p className="text-sm text-slate-500 font-medium">No bookings found for this view.</p>
                            </div>
                        ) : (
                            displayedAppointments.map(app => (
                                <AppointmentCard
                                    key={app._id}
                                    id={app._id}
                                    patientName={app.patientName}
                                    date={app.appointmentDate}
                                    status={app.status}
                                    role="doctor"
                                    onAction={(id, action) => handleActionClick(id, action as "accept" | "cancel")}
                                    isLoading={isActionLoading && modalState.id === app._id}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalState.isOpen}
                title={modalState.action === "cancel" ? "Decline Request" : "Accept Booking"}
                description={modalState.action === "cancel"
                    ? "Are you sure you want to decline this appointment request? The patient will be notified."
                    : "Are you sure you want to confirm to see this patient at the requested time?"}
                confirmText={modalState.action === "cancel" ? "Yes, Decline" : "Yes, Accept"}
                onConfirm={executeAction}
                onCancel={() => setModalState({ isOpen: false, id: null, action: null })}
                isLoading={isActionLoading}
            />
        </DashboardLayout>
    );
}

export default function DoctorDashboard() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <DoctorDashboardContent />
        </Suspense>
    );
}
