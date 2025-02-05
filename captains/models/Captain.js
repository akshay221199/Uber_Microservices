import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const captainSchema = new Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        contact:{
            type:Number,
            required:true
        },
        // avatar:{
        //     type:String,
        //     require:true
        // },
        // coverImage:{
        //     type:[String],
        //     require:true
        // },
        refreshToken:{
            type:String
        },
        accessToken:{
            type:String
        },
        password:{
            type:String,
            required:true
        },
},
{
    timestamps:true
}
);

captainSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

captainSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password, this.password);
};

captainSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

captainSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export default mongoose.model('Captain', captainSchema);