import mongoose from "mongoose";
const enrollSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        instructor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        completedMaterials: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course.materials"
        }],
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress'
        },
        quizScores: [{
            materialId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            score: {
                type: Number,
                default: 0,
                min: 0
            },
            answeredAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true,
    }
);
export const Enroll = new mongoose.model("Enroll", enrollSchema)