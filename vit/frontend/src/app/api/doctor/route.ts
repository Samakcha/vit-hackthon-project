import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user || user.role !== "doctor") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const profile = await DoctorProfile.findOne({ userId: user._id as any });

        return NextResponse.json({ user, profile: profile || {} });
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user || user.role !== "doctor") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedProfile = await DoctorProfile.findOneAndUpdate(
            { userId: user._id as any },
            { ...body, userId: user._id as any },
            { new: true, upsert: true }
        );

        // Update user name if provided
        if (body.name && body.name !== user.name) {
            user.name = body.name;
            await user.save();
        }

        return NextResponse.json({ message: "Profile updated successfully", profile: updatedProfile });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
