import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";

export async function GET() {
    try {
        await connectToDatabase();

        const dummyDoctors = [
            { name: "Dr. Sarah Johnson", email: "sarah.j@example.com", specialization: "Cardiologist", experience: 12 },
            { name: "Dr. Michael Chen", email: "m.chen@example.com", specialization: "Dermatologist", experience: 8 },
            { name: "Dr. Emma Williams", email: "emma.w@example.com", specialization: "Pediatrician", experience: 15 },
            { name: "Dr. James Wilson", email: "j.wilson@example.com", specialization: "Neurologist", experience: 20 },
            { name: "Dr. Lisa Anderson", email: "lisa.a@example.com", specialization: "Orthopedic Surgeon", experience: 10 },
            { name: "Dr. Robert Taylor", email: "r.taylor@example.com", specialization: "Dentist", experience: 7 },
            { name: "Dr. Maria Garcia", email: "m.garcia@example.com", specialization: "Psychiatrist", experience: 14 },
            { name: "Dr. David Miller", email: "d.miller@example.com", specialization: "Ophthalmologist", experience: 9 },
        ];

        for (const doc of dummyDoctors) {
            // Create User
            let user = await User.findOne({ email: doc.email });
            if (!user) {
                user = await User.create({
                    clerkId: `dummy_${Math.random().toString(36).substr(2, 9)}`,
                    name: doc.name,
                    email: doc.email,
                    role: "doctor",
                    isVerified: true
                });
            } else {
                user.isVerified = true;
                user.role = "doctor";
                await user.save();
            }

            // Create Profile
            await DoctorProfile.findOneAndUpdate(
                { userId: user._id },
                {
                    userId: user._id,
                    phone: "+1 (555) 000-0000",
                    specialization: doc.specialization,
                    yearsOfExperience: doc.experience,
                    availabilitySlots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: "Successfully seeded dummy doctors", count: dummyDoctors.length });
    } catch (error) {
        console.error("Seeding error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
