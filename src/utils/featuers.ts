import mongoose from "mongoose";
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

export const invalidateCache = async ({product, order, admin}:invalidateCacheProps) =>{
    if(product){
        const productKeys: string[] = [
            "admin-products",
            "categories",
            "latest-products"
        ]
        const products = await Product.find({}).select("_id")
        products.forEach( i => {
            productKeys.push(`product-${i._id}`)
        })
        myCache.del(productKeys)
    }
    if(order){
        const orderKeys: string[] = [
            "all-orders"
        ]
        const users = await User.find({}).select("_id")
        users.forEach(i => {
            orderKeys.push(`my-orders-${i._id}`)
        });
        
        const orders = await Order.find({}).select("_id")
        orders.forEach(i=>{
            orderKeys.push(`order-${i._id}`)
        })
        
        myCache.del(orderKeys)
    }
    if(admin){

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