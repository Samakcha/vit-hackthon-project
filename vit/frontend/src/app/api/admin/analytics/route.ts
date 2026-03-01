import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import DoctorProfile from "@/models/DoctorProfile";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user || user.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // 1. Total Metrics
        const totalUsers = await User.countDocuments();
        const totalDoctors = await User.countDocuments({ role: "doctor" });
        const totalPatients = await User.countDocuments({ role: "patient" });
        const totalAppointments = await Appointment.countDocuments();

        // 2. Cancellation Rate
        const cancelledCount = await Appointment.countDocuments({ status: "cancelled" });
        const cancellationRate = totalAppointments > 0
            ? ((cancelledCount / totalAppointments) * 100).toFixed(1) + "%"
            : "0%";

        // 3. Most Booked Specialization (Aggregation Pipeline)
        const specializationAggregation = await Appointment.aggregate([
            {
                $lookup: {
                    from: "doctorprofiles",
                    localField: "doctorId",
                    foreignField: "userId",
                    as: "doctorProfile"
                }
            },
            {
                $unwind: {
                    path: "$doctorProfile",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: "$doctorProfile.specialization",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 1
            }
        ]);

        const mostBookedSpecialization = specializationAggregation.length > 0
            ? specializationAggregation[0]._id
            : "N/A";

        // 4. Appointments Per Day (For Recharts)
        // Grouping by date string YYYY-MM-DD
        const appointmentsPerDay = await Appointment.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                    appointments: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    appointments: 1
                }
            },
            {
                $sort: { date: 1 }
            },
            {
                $limit: 14 // Last 14 days or upcoming 14 days
            }
        ]);

        return NextResponse.json({
            metrics: {
                totalUsers,
                totalDoctors,
                totalPatients,
                totalAppointments,
                cancellationRate,
                mostBookedSpecialization
            },
            charts: {
                appointmentsPerDay
            }
        });
    } catch (error) {
        console.error("Admin analytics error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
