import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceProductStock } from "../utils/featuers.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
export const myOrders = TryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    let orders = [];
    const key = `my-orders-${user}`;
    if (myCache.has(key))
        orders = JSON.parse(myCache.get(key));
    else {
        orders = await Order.find({ user }).populate("user", "name");
        myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders
    });
});
export const allOrders = TryCatch(async (req, res, next) => {
    const key = "all-orders";
    let orders = [];
    if (myCache.has(key))
        orders = JSON.parse(myCache.get(key));
    else {
        orders = await Order.find({}).populate("user", "name");
        myCache.set(key, JSON.stringify(orders));
    }
    res.status(200).json({
        success: true,
        orders
    });
});
export const getOrderDetails = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order;
    if (myCache.has(key))
        order = JSON.parse(myCache.get(key));
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order)
            return next(new ErrorHandler("Order not Found", 404));
        myCache.set(key, JSON.stringify(order));
    }
    res.status(200).json({
        success: true,
        order
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, user, subTotal, tax, shippingCharges, discount, total, status, orderItems } = req.body;
    if (!shippingInfo ||
        !user ||
        !subTotal ||
        !tax ||
        !total ||
        !status ||
        !orderItems)
        return next(new ErrorHandler("Please Enter All Fields", 400));
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
    });
    await reduceProductStock(orderItems);
    invalidateCache({ product: true, order: true, admin: true, userId: user, productId: orderItems.map(i => i.productId) });
    res.status(200).json({
        success: true,
        message: "Order Placed Successfully"
    });
});
export const updateOrderStatus = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not Found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
        default:
            order.status = "Delivered";
            break;
    }
    order.save();
    invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: String(order._id) });
    res.status(200).json({
        success: true,
        message: "Order Processed Successfully"
    });
});
export const cancelOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not Found", 404));
    await order.deleteOne();
    invalidateCache({ product: false, order: true, admin: true, userId: order.user, orderId: String(order._id) });
    res.status(200).json({
        success: true,
        message: "Order Deleted Successfully"
    });
});
//# sourceMappingURL=order.js.map