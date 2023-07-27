const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:
    {
        type:String, 
        required:true ["Name is required"],
        unique:true
    },
    lastName:
    {
        type:String, 
        required:true ["Name is required"],
        unique:true
    },
    email:
    {
        type:String, 
        required:true ["email is required"],
        unique:true,
        lowercase: true
    },
    password:
    {
        type:String, 
        required:true ["password is required"],
        unique:true,
        minLength: 6
    },
    token:
    {
        type:String
    },
    isAdmin: 
    {
        type:Boolean, 
        default: false
    },
    isLoggedIn: 
    {
        type:Boolean, 
        default: false
    },
    isVerified: 
    {
        type:Boolean, 
        default: false
    },
    isPremium: 
    {
        type:Boolean, 
        default: false
    },
    isBlocked: 
    {
        type:Boolean, 
        default: false
    },
    profilePicture: [
    {
        type:String, 
        required: true
    }
]
});

const userModel = mongoose.model("user",userSchema );

module.exports = userModel