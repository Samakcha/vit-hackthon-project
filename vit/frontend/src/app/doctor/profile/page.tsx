"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import {
    Stethoscope,
    Phone,
    Clock,
    Briefcase,
    Save,
    XCircle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    User,
    MapPin
} from "lucide-react";

function DoctorProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const isOnboarding = searchParams.get("onboarding") === "true";

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        specialization: "",
        yearsOfExperience: "",
        availabilitySlots: ["9:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/doctor");
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        setFormData({
                            name: data.user.name || "",
                            phone: data.profile.phone || "",
                            address: data.profile.address || "",
                            specialization: data.profile.specialization || "",
                            yearsOfExperience: data.profile.yearsOfExperience?.toString() || "",
                            availabilitySlots: data.profile.availabilitySlots?.length > 0
                                ? data.profile.availabilitySlots
                                : ["9:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"]
                        });
                    }
                }
            } catch (error) {
                toast("Failed to load profile", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/doctor", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
                })
            });

            if (res.ok) {
                toast("Profile updated successfully!", "success");
                if (isOnboarding) {
                    router.push("/doctor");
                }
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast("Error updating profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <DashboardLayout role="doctor">
            <div className="max-w-5xl mx-auto pb-20 animate-fade-in relative z-10">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                            Professional Credentials
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            {isOnboarding ? "Complete Your " : "Manage Your "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-500 to-teal-600">Practitioner Profile</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-2xl">
                            Initialize your digital clinical profile to start accepting consultations and managing your patient flow.
                        </p>
                    </div>
                    {isOnboarding && (
                        <div className="bg-white/40 backdrop-blur-xl p-4 rounded-3xl border border-white/60 shadow-xl flex items-center gap-4 animate-bounce-subtle">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">First Step</p>
                                <p className="text-sm font-bold text-slate-900">Initialize Identity</p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Basic Info */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Personal Details */}
                            <section className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors"></div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Contact</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Professional Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden"
                                                placeholder="Dr. Jane Smith"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Contact Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                className="block w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Clinic Address / Location</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden"
                                                placeholder="123 Medical Plaza, Suite 400, Health City"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Clinical Expertise */}
                            <section className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-teal-500/10 transition-colors"></div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center border border-teal-200">
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Expertise</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-hidden"
                                                placeholder="e.g. Cardiologist, Neurologist"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Years of Experience</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                className="block w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-hidden"
                                                placeholder="10"
                                                value={formData.yearsOfExperience}
                                                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Availability */}
                        <div className="lg:col-span-1 space-y-10">
                            <section className="bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden h-full">
                                <div className="absolute bottom-0 right-0 h-40 w-40 bg-white/5 blur-3xl rounded-full -mr-20 -mb-20"></div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Clinical Hours</h3>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-slate-400 font-medium text-sm">Define your standard consultation blocks. These will be visible to patients for selection.</p>

                                    {formData.availabilitySlots.map((slot, idx) => (
                                        <div key={idx} className="relative group">
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-slate-600 focus:bg-white/10 focus:border-emerald-500 transition-all outline-hidden"
                                                value={slot}
                                                onChange={(e) => {
                                                    const newSlots = [...formData.availabilitySlots];
                                                    newSlots[idx] = e.target.value;
                                                    setFormData({ ...formData, availabilitySlots: newSlots });
                                                }}
                                            />
                                            {idx > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        availabilitySlots: formData.availabilitySlots.filter((_, i) => i !== idx)
                                                    })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 p-1"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setFormData({
                                            ...formData,
                                            availabilitySlots: [...formData.availabilitySlots, "9:00 AM - 1:00 PM"]
                                        })}
                                        className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-slate-400 font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all"
                                    >
                                        + Add Time Block
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between bg-white/40 backdrop-blur-3xl p-6 rounded-[32px] border border-white/60 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-4 rounded-2xl text-slate-500 font-bold hover:bg-white hover:text-slate-900 transition-all"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isSaving ? (
                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {isOnboarding ? "Initialize Console" : "Save Clinical Profile"}
                            <ChevronRight className="h-5 w-5 opacity-50" />
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default function DoctorProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <DoctorProfileContent />
        </Suspense>
    );
}
