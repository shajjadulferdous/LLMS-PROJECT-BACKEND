import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["bank", "dummy"], default: "bank" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    note: { type: String }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
