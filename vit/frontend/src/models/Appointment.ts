import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
    patientId: mongoose.Schema.Types.ObjectId;
    doctorId: mongoose.Schema.Types.ObjectId;
    appointmentDate: Date;
    status: "pending" | "accepted_by_doctor" | "confirmed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
    {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointmentDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "accepted_by_doctor", "confirmed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Appointment: Model<IAppointment> =
    mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
