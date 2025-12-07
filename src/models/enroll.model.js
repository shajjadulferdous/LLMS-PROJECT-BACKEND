import mongoose from "mongoose";
const enrollSchema = new mongoose.Schema(
    {
        course :{
             type:mongoose.Schema.Types.ObjectId,
             ref:"Course",
             required:true
        },
        instructor:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required: true
            }
        ]
    },{
        timestamps:true
    }
)
export const Enroll = new mongoose.model("Enroll",enrollSchema)