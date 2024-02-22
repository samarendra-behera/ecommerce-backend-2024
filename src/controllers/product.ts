import {Request} from 'express'
import { TryCatch } from "../middlewares/error.js";
import { newProductReqBody } from "../types/types.js";
import { Product } from '../models/product.js';
import ErrorHandler from '../utils/utility-class.js';


export const newProduct = TryCatch(async(req:Request<{},{},newProductReqBody>, res, next)=>{
    const {name, price, category, stock } = req.body;
    if (!name || !price || !category || !stock) return next(new ErrorHandler("Please add all fields", 400))
    const photo = req.file;
    const product = await Product.create({
        name, 
        price, 
        category:category.toLowerCase(), 
        stock, 
        photo: photo?.path})
    return res.status(201).json({
        success: true,
        message: "Product Added Successfully",
        product
    })
})