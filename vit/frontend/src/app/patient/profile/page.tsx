"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import {
    User,
    Phone,
    UserPlus,
    Activity,
    Height as HeightIcon,
    Weight as WeightIcon,
    FileText,
    Save,
    ArrowLeft,
    Trash2,
    Check
} from "lucide-react";

function PatientProfileContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        age: "",
        sex: "",
        height: "",
        weight: "",
        bloodGroup: "",
        caretakerName: "",
        caretakerPhone: "",
        medicalHistory: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/patient");
                if (!res.ok) throw new Error("Failed to fetch profile");
                const data = await res.json();

                setFormData({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.profile.phone || "",
                    age: data.profile.age || "",
                    sex: data.profile.sex || "",
                    height: data.profile.height || "",
                    weight: data.profile.weight || "",
                    bloodGroup: data.profile.bloodGroup || "",
                    caretakerName: data.profile.caretakerName || "",
                    caretakerPhone: data.profile.caretakerPhone || "",
                    medicalHistory: data.profile.medicalHistory || ""
                });
            } catch (error) {
                toast("Error loading profile", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/patient", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Failed to update profile");
            toast("Profile updated successfully", "success");
            router.push("/patient");
        } catch (error) {
            toast("Error updating profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <DashboardLayout role="patient">
            <div className="flex flex-col gap-8 animate-fade-in max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Personal <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Health Record</span>
                        </h2>
                        <p className="text-slate-500 font-medium pt-1">Keep your information up to date for better care.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Information */}
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Primary Identity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Full Name"
                                icon={User}
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                placeholder="Enter your full name"
                            />
                            <InputField
                                label="Email Address"
                                icon={FileText}
                                value={formData.email}
                                disabled
                                placeholder="Email"
                            />
                            <InputField
                                label="Phone Number"
                                icon={Phone}
                                value={formData.phone}
                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                placeholder="+1 (555) 000-0000"
                            />
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Biological Sex</label>
                                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
                                    {['Male', 'Female', 'Other'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, sex: s.toLowerCase() })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.sex === s.toLowerCase()
                                                    ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vitals & Health Metrics */}
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                <Activity className="h-6 w-6 text-secondary" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Biological Metrics</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <InputField
                                label="Age"
                                type="number"
                                value={formData.age}
                                onChange={(val) => setFormData({ ...formData, age: val })}
                                placeholder="25"
                            />
                            <InputField
                                label="Height (cm)"
                                type="number"
                                value={formData.height}
                                onChange={(val) => setFormData({ ...formData, height: val })}
                                placeholder="175"
                            />
                            <InputField
                                label="Weight (kg)"
                                type="number"
                                value={formData.weight}
                                onChange={(val) => setFormData({ ...formData, weight: val })}
                                placeholder="70"
                            />
                            <InputField
                                label="Blood Group"
                                value={formData.bloodGroup}
                                onChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                                placeholder="O+"
                            />
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-orange-400/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-orange-400/10 flex items-center justify-center border border-orange-400/20">
                                <UserPlus className="h-6 w-6 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Emergency Protocol</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Caretaker Name"
                                icon={User}
                                value={formData.caretakerName}
                                onChange={(val) => setFormData({ ...formData, caretakerName: val })}
                                placeholder="Next of Kin / Guardian"
                            />
                            <InputField
                                label="Caretaker Phone"
                                icon={Phone}
                                value={formData.caretakerPhone}
                                onChange={(val) => setFormData({ ...formData, caretakerPhone: val })}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-400/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                                <FileText className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical History</h3>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Past Diseases & Conditions</label>
                            <textarea
                                value={formData.medicalHistory}
                                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                rows={4}
                                placeholder="Please describe any chronic conditions, allergies, or past major illnesses..."
                                className="w-full bg-slate-100/50 rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="h-14 px-8 rounded-2xl text-slate-500 font-bold hover:bg-white transition-all active:scale-95"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="h-14 px-10 rounded-2xl bg-linear-to-r from-primary to-secondary text-white font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            Sync Health Record
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

function InputField({ label, icon: Icon, value, onChange, placeholder, disabled, type = "text" }: any) {
    return (
        <div className="space-y-2 group/input">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className={`relative flex items-center ${disabled ? 'opacity-60' : ''}`}>
                {Icon && <Icon className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within/input:text-primary transition-colors" />}
                <input
                    type={type}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full h-14 bg-slate-100/50 rounded-2xl border border-slate-200 ${Icon ? 'pl-12' : 'px-6'} pr-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-inner`}
                />
            </div>
        </div>
    );
}

export default function PatientProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <PatientProfileContent />
        </Suspense>
    );
}
