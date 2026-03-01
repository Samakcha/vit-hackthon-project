import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { sendReminderEmail } from "@/lib/mailer";

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user || user.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingAppointments = await Appointment.find({
            status: "confirmed",
            appointmentDate: {
                $gte: now,
                $lte: next24Hours,
            },
        }).populate("patientId", "name email").populate("doctorId", "name");

        let count = 0;
        for (const app of upcomingAppointments) {
            const patient = app.patientId as any;
            const doctor = app.doctorId as any;
            if (patient.email) {
                const success = await sendReminderEmail(
                    patient.email,
                    patient.name,
                    doctor.name,
                    app.appointmentDate
                );
                if (success) count++;
            }
        }

        return NextResponse.json({ message: "Reminder job executed successfully", emailsSent: count });
    } catch (error) {
        console.error("Manual cron trigger error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
