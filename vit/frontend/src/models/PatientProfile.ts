import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatientProfile extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    phone: string;
    age: number;
    sex: string;
    height: number;
    weight: number;
    medicalHistory: string;
    caretakerName?: string;
    caretakerPhone?: string;
    bloodGroup?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PatientProfileSchema: Schema<IPatientProfile> = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        phone: { type: String, required: true },
        age: { type: Number },
        sex: { type: String },
        height: { type: Number },
        weight: { type: Number },
        medicalHistory: { type: String },
        caretakerName: { type: String },
        caretakerPhone: { type: String },
        bloodGroup: { type: String },
    },
    { timestamps: true }
);

const PatientProfile: Model<IPatientProfile> =
    mongoose.models.PatientProfile || mongoose.model<IPatientProfile>("PatientProfile", PatientProfileSchema);

export default PatientProfile;
