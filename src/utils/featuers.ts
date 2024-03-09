import mongoose, { Document } from "mongoose";
import {invalidateCacheProps, orderItemType} from '../types/types.js'
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";

export const connectDB = (url:string)=>{
    mongoose.connect(url, {
        dbName: "Ecommerce_24",
    }).then((c)=>console.log(`DB Connected to ${c.connection.host}`))
    .catch((e)=>console.log(e))
}

export const invalidateCache = ({product, order, admin, userId,productId, orderId}:invalidateCacheProps) =>{
    if(product){
        const productKeys: string[] = [
            "admin-products",
            "categories",
            "latest-products"
        ]
        if ( typeof productId === 'string') productKeys.push(`product-${productId}`)
        if (typeof productId === 'object') productId.forEach(i=> productKeys.push(`product-${i}`))
        myCache.del(productKeys)
    }
    if(order){
        const orderKeys: string[] = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`
        ]
        
        myCache.del(orderKeys)
    }
    if(admin){
        myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts"
        ])
    }
}

export const reduceProductStock = async(orderItems: orderItemType[])=>{
    for(let i=0; i<orderItems.length; i++){
        const order = orderItems[i]
        const product = await Product.findById(order.productId)
        if(!product) throw new Error("Product Not Found")
        product.stock -= order.quantity;
        await product.save()
    }
};

export const calculatePercentage = (thisMonth:number, lastMonth:number) =>{
    if(lastMonth === 0) return thisMonth * 100;
    const per = (thisMonth  / lastMonth) * 100;
    return Number(per.toFixed(0));
}

interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type FunProps = {
    length: number;
    docArray: MyDocument[];
    today: Date;
    property?: "discount" | "total";
};


export const getChartData = ({
    length,
    docArray,
    today,
    property
}:FunProps) =>{
    const data:number[] = new Array(length).fill(0);

    docArray.forEach((i)=>{
        const creationDate = i.createdAt;
        
        const monthDiff = ((today.getMonth() - creationDate.getMonth()) + 12)  % 12;
        const dataIndex = length - monthDiff -1;
        if(length > dataIndex){
            data[dataIndex] += property ? i[property]! : 1;
        }
    });
    return data;

}
