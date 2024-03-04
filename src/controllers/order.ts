import {Request} from "express"
import { TryCatch } from "../middlewares/error.js";
import { newOrderReqBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceProductStock } from "../utils/featuers.js";
import ErrorHandler from "../utils/utility-class.js";

export const newOrder = TryCatch(async(req:Request<{}, {}, newOrderReqBody>, res, next)=>{
    const {
        shippingInfo,
        user,
        subTotal,
        tax,
        shippingCharges,
        discount,
        total,
        status,
        orderItems
    } = req.body
    if(!shippingInfo ||
        !user ||
        !subTotal ||
        !tax ||
        !shippingCharges ||
        !discount ||
        !total ||
        !status ||
        !orderItems
        ) return next(new ErrorHandler("Please Enter All Fields", 400))
    await Order.create({
        shippingInfo,
        user,
        subTotal,
        tax,
        shippingCharges,
        discount,
        total,
        status,
        orderItems
    })
    await reduceProductStock(orderItems);

    await invalidateCache({product:true, admin:true});
    res.status(200).json({
        success: true,
        message: "Order Placed Successfully"
    })
})