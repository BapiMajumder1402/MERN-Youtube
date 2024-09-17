import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
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

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

export const User= mongoose.model("User",userSchema)