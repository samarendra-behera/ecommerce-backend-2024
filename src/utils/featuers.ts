import mongoose from "mongoose";
import {invalidateCacheProps} from '../types/types.js'
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

export const connectDB = ()=>{
    mongoose.connect("mongodb+srv://samarendrabeherapapu:nQ4mG3KPKyO0NOLD@cluster0.nti089h.mongodb.net/?retryWrites=true&w=majority", {
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

    }
    if(admin){

    }
}