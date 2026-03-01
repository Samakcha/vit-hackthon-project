import { format } from "date-fns";
import { Calendar, Clock, User as UserIcon } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface AppointmentCardProps {
    id: string;
    patientName?: string;
    doctorName?: string;
    specialization?: string;
    date: Date;
    status: "pending" | "accepted_by_doctor" | "confirmed" | "cancelled";
    role: "patient" | "doctor" | "admin";
    onAction?: (id: string, action: "accept" | "confirm" | "cancel") => void;
    isLoading?: boolean;
}

export default function AppointmentCard({
    id,
    patientName,
    doctorName,
    specialization,
    date,
    status,
    role,
    onAction,
    isLoading
}: AppointmentCardProps) {
    const isPast = new Date(date) < new Date();

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            {/* Decorative Gradient Background */}
            <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-linear-to-br from-primary/5 to-secondary/5 blur-3xl group-hover:from-primary/10 group-hover:to-secondary/10 transition-all"></div>

            <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4 items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-slate-100 to-slate-200 text-slate-500 shadow-inner group-hover:from-primary/10 group-hover:to-secondary/10 group-hover:text-primary transition-all duration-500">
                        <UserIcon className="h-7 w-7" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-lg leading-tight">
                            {role === "patient" ? `Dr. ${doctorName}` : patientName}
                        </h4>
                        {role === "patient" && specialization && (
                            <p className="text-sm font-bold text-primary mt-0.5">{specialization}</p>
                        )}
                        {role !== "patient" && (
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">Patient Record</p>
                        )}
                    </div>
                </div>
                <div className="transform transition-transform group-hover:scale-110">
                    <StatusBadge status={status} />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/20 shadow-sm">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{format(new Date(date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/20 shadow-sm">
                    <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                        <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{format(new Date(date), "h:mm a")}</span>
                </div>
            </div>

            {!isPast && onAction && (
                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100/50 relative z-10">
                    {role === "doctor" && status === "pending" && (
                        <button
                            disabled={isLoading}
                            onClick={() => onAction(id, "accept")}
                            className="flex-1 rounded-2xl bg-linear-to-r from-primary to-blue-600 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            Accept Request
                        </button>
                    )}

                    {role === "patient" && status === "accepted_by_doctor" && (
                        <button
                            disabled={isLoading}
                            onClick={() => onAction(id, "confirm")}
                            className="flex-1 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            Confirm Booking
                        </button>
                    )}

                    {status !== "cancelled" && status !== "confirmed" && (
                        <button
                            disabled={isLoading}
                            onClick={() => onAction(id, "cancel")}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            Decline
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
