import {Request} from 'express'
import { TryCatch } from "../middlewares/error.js";
import { newProductReqBody } from "../types/types.js";
import { Product } from '../models/product.js';
import ErrorHandler from '../utils/utility-class.js';
import { rm } from 'fs';


export const newProduct = TryCatch(async(req:Request<{},{},newProductReqBody>, res, next)=>{
    const {name, price, category, stock } = req.body;
    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please Add Photo", 400))
    if (!name || !price || !category || !stock) {
        rm(photo.path, ()=>{
            console.log("Photo Deleted")
        })
        return next(new ErrorHandler("Please add all fields", 400))
    }
    const product = await Product.create({
        name, 
        price, 
        category:category.toLowerCase(), 
        stock, 
        photo: photo.path})
    return res.status(201).json({
        success: true,
        message: "Product Added Successfully",
        product
    })
})