import mongoose from "mongoose";
import bcrypt from "bcrypt";

const BankSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        accountNo: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            min: 0,
            default: 0
        },
        history: [{
            type: String
        }
        ]
    },
    {
        timestamps: true
    }
)
BankSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

BankSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


export const Bank = new mongoose.model("Bank", BankSchema)