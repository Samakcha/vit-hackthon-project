"use client";

import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import {
    Search,
    Stethoscope,
    Star,
    Calendar,
    Clock,
    ChevronRight,
    Filter,
    MapPin,
    ArrowRight,
    User,
    Check
} from "lucide-react";

function FindDoctorsContent() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const { toast } = useToast();

    const specializations = [
        "All", "Cardiologist", "Dermatologist", "Pediatrician", "Neurologist",
        "Orthopedic Surgeon", "Dentist", "Psychiatrist", "Ophthalmologist", "General Physician"
    ];

    const fetchDoctors = async (query = searchQuery) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append("query", query);
            if (selectedSpecialization !== "All") params.append("specialization", selectedSpecialization);

            const res = await fetch(`/api/doctors?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch doctors");
            const data = await res.json();
            setDoctors(data);
        } catch (error) {
            toast("Error loading doctors", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedSpecialization]);

    const handleBook = async () => {
        if (!selectedDoctor || !bookingDate) return;

        setIsBooking(true);
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: selectedDoctor._id,
                    appointmentDate: bookingDate
                })
            });

            if (res.ok) {
                toast("Appointment request sent successfully!", "success");
                setSelectedDoctor(null);
                setBookingDate("");
            } else {
                const data = await res.text();
                toast(data || "Failed to book appointment", "error");
            }
        } catch (error) {
            toast("Error booking appointment", "error");
        } finally {
            setIsBooking(false);
        }
    };

    const runSeed = async () => {
        toast("Seeding dummy data...", "success");
        try {
            const res = await fetch("/api/seed");
            if (res.ok) {
                toast("Dummy data seeded! Refreshing...", "success");
                fetchDoctors();
            }
        } catch (e) {
            toast("Seed failed", "error");
        }
    };

    return (
        <DashboardLayout role="patient">
            <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in relative z-10 overflow-hidden">
                {/* Fixed Top Section */}
                <div className="shrink-0 space-y-6 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                                Discovery Hub
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                                Find <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Specialists</span>
                            </h2>
                        </div>
                        <button
                            onClick={runSeed}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors border border-dashed border-slate-200 px-4 py-2 rounded-xl"
                        >
                            Sync Dummy Data
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Interactive Search Bar */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-14 pr-6 py-4 rounded-[24px] bg-white border border-slate-100 text-slate-900 font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-lg shadow-slate-200/50 outline-hidden"
                                    placeholder="Search by doctor name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isLoading && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`h-14 w-14 rounded-[20px] flex items-center justify-center transition-all ${isFilterOpen ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "bg-white text-slate-400 border border-slate-100 italic"}`}
                            >
                                <Filter className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Expandable Filter Menu */}
                        <div className={`transition-all duration-300 overflow-hidden ${isFilterOpen ? "max-h-40 opacity-100 mb-2" : "max-h-0 opacity-0"}`}>
                            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar pt-2">
                                {specializations.map(spec => (
                                    <button
                                        key={spec}
                                        onClick={() => setSelectedSpecialization(spec)}
                                        className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedSpecialization === spec
                                            ? "bg-slate-900 text-white shadow-xl scale-105"
                                            : "bg-white text-slate-500 border border-slate-100 hover:border-primary hover:text-primary"
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading && doctors.length === 0 ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-72 rounded-[32px] border border-slate-100 bg-white/50 animate-pulse shadow-sm"></div>
                            ))
                        ) : doctors.length === 0 ? (
                            <div className="col-span-full rounded-[40px] border-4 border-dashed border-slate-100 bg-slate-100/30 p-20 text-center backdrop-blur-sm">
                                <Stethoscope className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <h4 className="text-xl font-black text-slate-900 mb-2 italic">Unfound <span className="text-primary">Legacies</span></h4>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">None of our specialists matched "{searchQuery || selectedSpecialization}". Double check the spelling!</p>
                            </div>
                        ) : (
                            doctors.map(doc => (
                                <div key={doc._id} className="group relative bg-white rounded-[32px] border border-slate-100 p-6 shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {doc.isVerified && (
                                                <div className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                                                    <Check className="h-2 w-2" />
                                                    Verified
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                <span className="text-xs font-black">4.9</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{doc.name}</h3>
                                            <p className="text-primary font-black text-[10px] uppercase tracking-widest mt-1 italic">{doc.specialization}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{doc.experience}y Exp.</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{doc.address}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            Book Now
                                            <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Booking Modal */}
                {selectedDoctor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-fade-in">
                        <div className="bg-white rounded-[48px] w-full max-w-xl p-12 shadow-2xl border border-white animate-slide-up relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>

                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Secure <span className="text-primary">Booking</span></h3>
                                    <p className="text-slate-500 font-medium">Select your preferred time slot for {selectedDoctor.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedDoctor(null)}
                                    className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center"
                                >
                                    <ArrowRight className="h-6 w-6 rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Specialist</label>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Stethoscope className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg">{selectedDoctor.name}</p>
                                            <p className="text-sm font-bold text-primary italic uppercase tracking-widest">{selectedDoctor.specialization}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                <MapPin className="h-3 w-3" />
                                                <p className="text-[10px] font-medium truncate max-w-[200px]">{selectedDoctor.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Consultation Date</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            className="block w-full pl-14 pr-6 py-5 rounded-3xl bg-white border border-slate-100 text-slate-900 font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-hidden appearance-none"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleBook}
                                    disabled={!bookingDate || isBooking}
                                    className="w-full py-5 rounded-[28px] bg-slate-900 text-white font-black text-lg shadow-xl hover:bg-primary disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isBooking ? (
                                        <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Clock className="h-5 w-5" />
                                    )}
                                    Confirm Appointment Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default function FindDoctorsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-mesh">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <FindDoctorsContent />
        </Suspense>
    );
}
