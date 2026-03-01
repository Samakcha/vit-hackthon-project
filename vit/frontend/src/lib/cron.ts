import cron from "node-cron";
import connectToDatabase from "./db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import { sendReminderEmail } from "./mailer";

export const startCronJobs = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running scheduled email reminder check...");
        try {
            await connectToDatabase();

            const now = new Date();
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Find confirmed appointments taking place in the next 24 hours
            // that haven't had a reminder sent yet (in a real app, track reminderSent flag)
            const upcomingAppointments = await Appointment.find({
                status: "confirmed",
                appointmentDate: {
                    $gte: now,
                    $lte: next24Hours,
                },
            }).populate("patientId", "name email").populate("doctorId", "name");

            console.log(`Found ${upcomingAppointments.length} upcoming appointments needing reminders.`);

            for (const app of upcomingAppointments) {
                // Send email
                const patient = app.patientId as any;
                const doctor = app.doctorId as any;
                const patientName = patient.name;
                const patientEmail = patient.email;
                const doctorName = doctor.name;

                if (patientEmail) {
                    await sendReminderEmail(
                        patientEmail,
                        patientName,
                        doctorName,
                        app.appointmentDate
                    );
                    // Ideally mark app.reminderSent = true here and save()
                }
            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });

    // Daily Cleanup: Delete unverified doctors older than 48 hours
    // Run at midnight every day
    cron.schedule("0 0 * * *", async () => {
        console.log("Running scheduled unverified doctor cleanup...");
        try {
            await connectToDatabase();
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            const staleDoctors = await User.find({
                role: "doctor",
                isVerified: false,
                createdAt: { $lte: twoDaysAgo }
            });

            console.log(`Found ${staleDoctors.length} stale unverified doctors for cleanup.`);

            for (const doctor of staleDoctors) {
                // Remove their profile
                await DoctorProfile.deleteOne({ userId: doctor._id });
                // Remove the user
                await User.deleteOne({ _id: doctor._id });
                console.log(`Cleanup: Deleted stale doctor ${doctor.name} (${doctor.email})`);
            }
        } catch (error) {
            console.error("Cleanup job error:", error);
        }
    });
};
