import { User } from '../models/user.js';
import ErrorHandler from '../utils/utility-class.js';
import { TryCatch } from '../middlewares/error.js';
export const newUser = TryCatch(async (req, res, next) => {
    const { _id, name, email, gender, photo, dob } = req.body;
    let user = await User.findOne({ _id });
    if (user)
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`
        });
    if (!_id || !name || !email || !gender || !photo || !dob)
        return next(new ErrorHandler("Please add all fields", 400));
    user = await User.create({ _id, name, email, gender, photo, dob: new Date(dob) });
    return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid User ID", 400));
    return res.status(200).json({
        success: true,
        user
    });
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid User ID", 400));
    await User.deleteOne({ _id: id });
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});
