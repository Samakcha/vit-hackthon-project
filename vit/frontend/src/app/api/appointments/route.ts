import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import DoctorProfile from "@/models/DoctorProfile";

// Create Appointment (Patient)
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { doctorId, appointmentDate } = body;

        if (!doctorId || !appointmentDate) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await connectToDatabase();

        const patient = await User.findOne({ clerkId: userId });
        if (!patient || patient.role !== "patient") {
            return new NextResponse("Forbidden: Only patients can book", { status: 403 });
        }

        // Check doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            return new NextResponse("Doctor not found", { status: 404 });
        }

        // Check for double booking (same doctor, same time)
        // In a real app, we'd check against slots, but for now exact time match
        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate: new Date(appointmentDate),
            status: { $in: ["pending", "accepted_by_doctor", "confirmed"] },
        });

        if (existingAppointment) {
            return new NextResponse("Time slot already booked", { status: 409 });
        }

        const appointment = await Appointment.create({
            patientId: patient._id as any,
            doctorId: doctorId as any,
            appointmentDate: new Date(appointmentDate),
            status: "pending",
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error("Create appointment error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Fetch Appointments (For Patient or Doctor depending on who requests)
export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user) return new NextResponse("User not found", { status: 404 });

        let appointments;

        if (user.role === "patient") {
            const appointmentsList = await Appointment.find({ patientId: user._id as any })
                .populate("doctorId", "name email")
                .sort({ appointmentDate: 1 as any });
            appointments = appointmentsList;

            // Also fetch doctor profiles to get specialization
            const doctorIds = appointments.map(a => (a.doctorId as any)._id);
            const doctorProfiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

            const enrichedAppointments = appointments.map(app => {
                const appObj = app.toObject();
                const doctorIdObj = app.doctorId as any;
                const docProfile = doctorProfiles.find(p => p.userId.toString() === doctorIdObj._id.toString());
                return {
                    ...appObj,
                    doctorName: doctorIdObj.name,
                    specialization: docProfile?.specialization
                };
            });

            return NextResponse.json(enrichedAppointments);
        } else if (user.role === "doctor") {
            const appointmentsList = await Appointment.find({ doctorId: user._id as any })
                .populate("patientId", "name email")
                .sort({ appointmentDate: 1 as any });
            appointments = appointmentsList;

            const enrichedAppointments = appointments.map(app => {
                const appObj = app.toObject();
                const patientIdObj = app.patientId as any;
                return {
                    ...appObj,
                    patientName: patientIdObj.name
                };
            });

            return NextResponse.json(enrichedAppointments);
        } else {
            // Admin route is separate, but prevent direct access here
            return new NextResponse("Forbidden", { status: 403 });
        }

    } catch (error) {
        console.error("Fetch appointments error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// Update Appointment Status
export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { appointmentId, action } = body;

        if (!appointmentId || !action) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ clerkId: userId });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return new NextResponse("Appointment not found", { status: 404 });

        // Validate the action based on role and current status
        // Patient: Confirm (if accepted), Cancel
        // Doctor: Accept (if pending), Cancel

        // Check Ownership/Access
        if (
            user.role === "patient" && appointment.patientId.toString() !== user._id.toString() ||
            user.role === "doctor" && appointment.doctorId.toString() !== user._id.toString()
        ) {
            return new NextResponse("Forbidden: Access denied", { status: 403 });
        }

        if (action === "cancel") {
            appointment.status = "cancelled";
        } else if (user.role === "patient" && action === "confirm" && appointment.status === "accepted_by_doctor") {
            appointment.status = "confirmed";
        } else if (user.role === "doctor" && action === "accept" && appointment.status === "pending") {
            appointment.status = "accepted_by_doctor";
        } else {
            return new NextResponse(`Invalid action '${action}' for role '${user.role}' or status skip detected.`, { status: 400 });
        }

        await appointment.save();

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Update appointment error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
