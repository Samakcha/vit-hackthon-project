"use client";

import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AppointmentCard from "@/components/AppointmentCard";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { CalendarDays, Filter, Search } from "lucide-react";

function AppointmentsContent() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const { toast } = useToast();
    const [modalState, setModalState] = useState<{ isOpen: boolean; id: string | null; action: "confirm" | "cancel" | null }>({
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
            toast("Error loading appointments", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

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
            fetchAppointments();
        } catch (error) {
            toast(`Error: Could not ${modalState.action} appointment`, "error");
        } finally {
            setIsActionLoading(false);
            setModalState({ isOpen: false, id: null, action: null });
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (filter === "all") return true;
        if (filter === "upcoming") return new Date(app.appointmentDate) >= new Date() && app.status !== "cancelled";
        if (filter === "past") return new Date(app.appointmentDate) < new Date();
        return app.status === filter;
    });

    return (
        <DashboardLayout role="patient">
            <div className="flex flex-col gap-8 animate-fade-in relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Consultation <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">History</span>
                        </h2>
                        <p className="text-slate-500 font-medium pt-1">View and manage your appointments with specialists.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white/40 backdrop-blur-3xl p-4 rounded-[32px] border border-white/60 shadow-xl">
                    <div className="flex items-center gap-3 px-4 border-r border-slate-200 mr-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Filter by</span>
                    </div>
                    {["all", "upcoming", "past", "pending", "confirmed", "cancelled"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'text-slate-500 hover:bg-white hover:text-primary'
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
                                <CalendarDays className="h-10 w-10 text-slate-400" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-2">No appointments found</h4>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or book a new consultation.</p>
                        </div>
                    ) : (
                        filteredAppointments.map(app => (
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

export default function PatientAppointmentsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <AppointmentsContent />
        </Suspense>
    );
}
