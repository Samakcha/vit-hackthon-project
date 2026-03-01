import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { role } = await req.json();
        if (!["patient", "doctor"].includes(role)) {
            return new NextResponse("Invalid role", { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { role },
            { new: true }
        );

        if (!user) return new NextResponse("User not found", { status: 404 });

        return NextResponse.json({ message: "Role updated successfully", role: user.role });
    } catch (error) {
        console.error("Error setting role:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
