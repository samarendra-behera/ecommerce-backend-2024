import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = (url) => {
    mongoose.connect(url, {
        dbName: "Ecommerce_24",
    }).then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
export const invalidateCache = ({ product, order, admin, userId, productId, orderId }) => {
    if (product) {
        const productKeys = [
            "admin-products",
            "categories",
            "latest-products"
        ];
        if (typeof productId === 'string')
            productKeys.push(`product-${productId}`);
        if (typeof productId === 'object')
            productId.forEach(i => productKeys.push(`product-${i}`));
        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`
        ];
        myCache.del(orderKeys);
    }
    if (admin) {
        myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ]);
    }
};
export const reduceProductStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const per = (thisMonth / lastMonth) * 100;
    return Number(per.toFixed(0));
};
export const getChartData = ({ length, docArray, today, property }) => {
    const data = new Array(length).fill(0);
    docArray.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = ((today.getMonth() - creationDate.getMonth()) + 12) % 12;
        const dataIndex = length - monthDiff - 1;
        if (length > dataIndex) {
            data[dataIndex] += property ? i[property] : 1;
        }
    });
    return data;
};
//# sourceMappingURL=featuers.js.map