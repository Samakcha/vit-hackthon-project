import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctorProfile extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    phone: string;
    specialization: string;
    yearsOfExperience: number;
    address: string;
    availabilitySlots: string[];
    createdAt: Date;
    updatedAt: Date;
}

const DoctorProfileSchema: Schema<IDoctorProfile> = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        phone: { type: String, required: true },
        specialization: { type: String, required: true },
        yearsOfExperience: { type: Number, required: true },
        address: { type: String, default: "" },
        availabilitySlots: [{ type: String }],
    },
    { timestamps: true }
);

const DoctorProfile: Model<IDoctorProfile> =
    mongoose.models.DoctorProfile || mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);

export default DoctorProfile;
