import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [{
            type: String,
            required: true,
            trim: true
        }],
        validate: {
            validator: function (arr) {
                return arr.length === 4;
            },
            message: 'Quiz must have exactly 4 options'
        }
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    timeLimit: {
        type: Number, // in seconds
        default: 60,
        min: 10
    }
});

const materialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["video", "Document", "link", "quiz"],
            required: true
        },
        CoursePicture: {
            type: String,
            required: false // Made optional
        },
        url: {
            type: String,
            trim: true
        },
        videoFile: {
            type: String, // Cloudinary URL for uploaded videos
            trim: true
        },
        documentFile: {
            type: String, // Cloudinary URL for uploaded documents
            trim: true
        },
        duration: {
            type: Number,
            min: 0
        },
        // Quiz specific fields - must have exactly ONE question
        quizQuestions: {
            type: [quizQuestionSchema],
            validate: {
                validator: function (arr) {
                    if (this.type === 'quiz') {
                        return arr && arr.length === 1;
                    }
                    return true;
                },
                message: 'Quiz must have exactly 1 question'
            }
        }
    }
)


const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    instructor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    materials: {
        type: [materialSchema],
        default: []
    }
    ,
    status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
    }
}, { timestamps: true })

export const Course = mongoose.model("Course", courseSchema)