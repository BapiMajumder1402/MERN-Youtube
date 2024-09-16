import mongoose ,{Schema} from "mongoose";

const userSchema =new Schema({
    fullName:{
        type:String,
        required:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    userName:{
        type:String,
        required:true,
        index:true
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
        required:true,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password Required"],
    },
    refreshToken:{
        type:String,
        required:true,
    },
},{timestamps:true})

export const User= mongoose.model("User",userSchema)