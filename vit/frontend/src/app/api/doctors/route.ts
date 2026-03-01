import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");
        const specialization = searchParams.get("specialization");

        await connectToDatabase();

        // 1. Find all doctors (loosened verification for discovery)
        let userFilter: any = { role: "doctor" };
        if (query) {
            userFilter.name = { $regex: query, $options: "i" };
        }

        const doctors = await User.find(userFilter).select("name email _id isVerified").sort({ isVerified: -1 });
        const doctorIds = doctors.map(d => d._id);

        // 2. Find profiles for these doctors
        let profileFilter: any = { userId: { $in: doctorIds as any } };
        if (specialization && specialization !== "All") {
            profileFilter.specialization = specialization;
        }

        const profiles = await DoctorProfile.find(profileFilter);
        const profiledDoctorIds = profiles.map(p => p.userId.toString());

        // 3. Filter and enrich. If specialization is set, only show those with matching profiles.
        // If no specialization is set, show all doctors (with fallback profile data).
        const finalDoctors = specialization && specialization !== "All"
            ? doctors.filter(doc => profiledDoctorIds.includes(doc._id.toString()))
            : doctors;

        const enrichedDoctors = finalDoctors.map(doc => {
            const profile = profiles.find(p => p.userId.toString() === doc._id.toString());
            return {
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                isVerified: doc.isVerified,
                specialization: profile?.specialization || "General Physician",
                experience: profile?.yearsOfExperience || 0,
                address: profile?.address || "Clinical Location",
                availability: profile?.availabilitySlots || []
            };
        });

        return NextResponse.json(enrichedDoctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
