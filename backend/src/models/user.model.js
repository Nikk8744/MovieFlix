import mongoose, {Schema} from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            unique: true,
            validate: [validator.isEmail, "Please provide a valid email"],
            trim: true,
        },
        phoneNumber: {
            type: Number,
            required: [true, "Phone Number is required"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            minlength: 6,
        },
        role: {
            type: String,
            deafult: "User",
            enum: ["User", "Admin"],
        },
        refreshToken: {
            type: String,
        },
        bookingHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Booking",
        }],
    },
    { timestamps: true }
);

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            phoneNumber: this.phoneNumber,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)

