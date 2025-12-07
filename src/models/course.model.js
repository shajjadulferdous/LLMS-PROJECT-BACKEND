import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
    {
        title: {
            type:String,
            required:true,
            trim:true
        },
        type:{
            type:String,
            enum:["video" , "Document" , "link" , "quiz"],
            required: true
        },
        CoursePicture:{
            type:String,
            required: true
        }

        ,url:{
            type:String,
            required:true,
            trim:true
        }
        ,
        duration :{
            type:Number,
            min:0
        }
    }
)


const courseSchema = new mongoose.Schema({
   title:{
      type:String,
      required:true,
      trim:true
   },
   description:{
     type:String,
     required:true,
     trim:true
   },
   price:{
     type:Number,
     required:true,
     min: 0
   },
   instructor:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true
   }],
   materials:{
       type:[materialSchema],
       default: []
   }
},{timestamps:true})

export const Course = mongoose.model("Course" , courseSchema)