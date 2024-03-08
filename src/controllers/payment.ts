import {Request} from 'express'
import { TryCatch } from "../middlewares/error.js";
import { newCouponReqBody } from '../types/types.js';
import { Coupon } from '../models/coupon.js';
import ErrorHandler from '../utils/utility-class.js';

export const newCoupon = TryCatch(async(req:Request<{}, {}, newCouponReqBody>, res, next)=>{
    const {code, amount} = req.body

    if(!code || !amount) return next(new ErrorHandler("Please enter both coupon and amount", 400))

    await Coupon.create({code, amount})

    res.status(201).json({
        success: true,
        message: `Coupon ${code} created Successfully`
    })
})