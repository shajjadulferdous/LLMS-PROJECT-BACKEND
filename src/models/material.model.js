import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId,
         ref: "Course", 
         required: true },
    title: { type: String,
         required: true,
          trim: true },
    type: { type: String,
         enum: ["video", "Document", "link", "quiz"],
          required: true },
    url: { type: String,
         required: true },
    duration: { type: Number,
         min: 0 },
    cover: { type: String }
}, { timestamps: true });

export const Material = mongoose.model("Material", materialSchema);
