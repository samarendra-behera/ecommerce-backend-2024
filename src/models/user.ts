import mongoose from "mongoose";
import validator from "validator"

interface IUser extends Document{
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    // Virtual Attribute
    age: number;

};

const schema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, "Please enter ID"],
        },
        name: {
            type: String,
            required: [true, "Please enter Name"],
        },
        email: {
            type: String,
            unique: [true, "Email already Exist"],
            required: [true, "Please enter Email"],
            validator: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, "Please add Photo"],
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: [true, "Please enter Gender"]
        },
        dob: {
            type: Date,
            required: [true, "Please enter Date of birth"],
        }
    },
    {
        timestamps: true
    }
)

schema.virtual('age').get(function (){
    const today = new Date()
    let age:number = today.getFullYear() - this.dob.getFullYear()
    if (today.getMonth()< this.dob.getMonth() || (today.getMonth() === this.dob.getMonth() && today.getDate() < this.dob.getDate())){
        return --age;
    }
    return age;
})

export const User = mongoose.model<IUser>('User', schema);