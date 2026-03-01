"use client";

import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { CalendarDays, Filter, Clock, CheckCircle2 } from "lucide-react";

function ScheduleContent() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const { toast } = useToast();
    const [modalState, setModalState] = useState<{ isOpen: boolean; id: string | null; action: "accept" | "cancel" | null }>({
        isOpen: false,
        id: null,
        action: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchAppointments = async () => {
        setIsLoading(true);
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

    useEffect(() => {
        fetchAppointments();
    }, []);

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

    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filter === "all") return true;
        if (filter === "today") {
            return appDate.getDate() === today.getDate() &&
                appDate.getMonth() === today.getMonth() &&
                appDate.getFullYear() === today.getFullYear() &&
                app.status !== "cancelled";
        }
        if (filter === "upcoming") return appDate > today && app.status !== "cancelled";
        if (filter === "pending") return app.status === "pending";
        if (filter === "confirmed") return app.status === "confirmed" || app.status === "accepted_by_doctor";
        return true;
    });

    return (
        <DashboardLayout role="doctor">
            <div className="flex flex-col gap-8 animate-fade-in relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Clinical <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-500 to-teal-600">Agenda</span>
                        </h2>
                        <p className="text-slate-500 font-medium pt-1">Manage your consultations and professional availability.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <Filter className="h-4 w-4" />
                            Preferences
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white/40 backdrop-blur-3xl p-4 rounded-[32px] border border-white/60 shadow-xl">
                    <div className="flex items-center gap-3 px-4 border-r border-slate-200 mr-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">View Mode</span>
                    </div>
                    {["all", "today", "upcoming", "pending", "confirmed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === f
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'text-slate-500 hover:bg-white hover:text-emerald-600'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-[32px] border border-white/40 bg-white/40 backdrop-blur-xl animate-pulse shadow-sm"></div>
                        ))
                    ) : filteredAppointments.length === 0 ? (
                        <div className="col-span-full rounded-[48px] border-4 border-dashed border-white/40 bg-white/30 p-24 text-center backdrop-blur-md">
                            <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                                <Clock className="h-10 w-10 text-slate-400" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-2">No agenda items</h4>
                            <p className="text-slate-500 font-medium">Your schedule is currently clear for this selection.</p>
                        </div>
                    ) : (
                        filteredAppointments.map(app => (
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

export default function DoctorSchedulePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <ScheduleContent />
        </Suspense>
    );
}
