import { Request } from "express"
import { TryCatch } from "../middlewares/error.js";
import { newOrderReqBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceProductStock } from "../utils/featuers.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { json } from "stream/consumers";

export const newOrder = TryCatch(async (req: Request<{}, {}, newOrderReqBody>, res, next) => {
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
    if (!shippingInfo ||
        !user ||
        !subTotal ||
        !tax ||
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

    await invalidateCache({ product: true, admin: true });
    res.status(200).json({
        success: true,
        message: "Order Placed Successfully"
    })
})

export const myOrders = TryCatch(async (req, res, next) => {
    const { id: user } = req.query
    let orders = [];
    const key = `my-orders-${user}`;

    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string)
    else {
        orders = await Order.find({user}).populate("user", "name")
        myCache.set(key, JSON.stringify(orders))
    }

    return res.status(200).json({
        success: true,
        orders
    })
})

export const allOrders = TryCatch(async(req, res, next)=>{
    const key = "all-orders"
    
    let orders = []
    if(myCache.has(key)) orders = JSON.parse(myCache.get(key) as string)
    else {
        orders = await Order.find({}).populate("user", "name")
        myCache.set(key, JSON.stringify(orders))
    }

    res.status(200).json({
        success: true,
        orders
    })

})

export const getOrderDetails = TryCatch(async (req, res, next) =>{
    const {id} = req.params
    const key = `order-${id}`

    let order;

    if(myCache.has(key)) order = JSON.parse(myCache.get(key) as string)
    else {
        order = await Order.findById(id).populate("user", "name")
        if (!order) return next(new ErrorHandler("Order not Found", 404))
        myCache.set(key, JSON.stringify(order))
    }

    res.status(200).json({
        success: true,
        order
    })
})