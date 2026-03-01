import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import DoctorProfile from "@/models/DoctorProfile";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        const { searchParams } = new URL(req.url);
        const roleParam = searchParams.get("role") as "patient" | "doctor" | null;

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectToDatabase();

        let dbUser = await User.findOne({ clerkId: userId });

        if (!dbUser) {
            dbUser = await User.create({
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                email: user.emailAddresses[0].emailAddress,
                role: roleParam || "none",
                isVerified: roleParam === "patient" ? true : false, // Doctors need verification
            });

            // Initialize Profile if role is set
            if (roleParam === "patient") {
                await PatientProfile.create({ userId: dbUser._id, phone: " ", sex: " " });
            } else if (roleParam === "doctor") {
                await DoctorProfile.create({ userId: dbUser._id, phone: " ", specialization: " ", yearsOfExperience: 0 });
            }
        } else if (dbUser.role === "none" && roleParam) {
            dbUser.role = roleParam;
            dbUser.isVerified = roleParam === "patient" ? true : false;
            await dbUser.save();

            // Initialize Profile when role is set for the first time
            if (roleParam === "patient") {
                await PatientProfile.findOneAndUpdate(
                    { userId: dbUser._id },
                    { userId: dbUser._id, phone: " ", sex: " " },
                    { upsert: true, new: true }
                );
            } else if (roleParam === "doctor") {
                await DoctorProfile.findOneAndUpdate(
                    { userId: dbUser._id },
                    { userId: dbUser._id, phone: " ", specialization: " ", yearsOfExperience: 0 },
                    { upsert: true, new: true }
                );
            }
        }

        // Strict Role Locking Validation
        if (roleParam && dbUser.role !== "none" && dbUser.role !== roleParam) {
            const errorUrl = new URL("/auth-error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
            errorUrl.searchParams.set("type", "role_mismatch");
            errorUrl.searchParams.set("existing", dbUser.role);
            return NextResponse.redirect(errorUrl);
        }

        // Role-based redirect
        let redirectPath = "/select-role";
        if (dbUser.role === "admin") redirectPath = "/admin";
        else if (dbUser.role === "doctor") redirectPath = "/doctor";
        else if (dbUser.role === "patient") redirectPath = "/patient";

        return NextResponse.redirect(new URL(redirectPath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    } catch (error) {
        console.error("Error syncing user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
