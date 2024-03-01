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

export const getlatestProducts = TryCatch(async (req, res, next)=>{
    const products = await Product.find({}).sort({createAt: -1}).limit(5);
    return res.status(200).json({
        success: true,
        products
    })
})

export const getProductCategories = TryCatch(async (req, res, next)=>{
    const categories = await Product.distinct("category");
    return res.status(200).json({
        success: true,
        categories
    })
})

export const getAdminProducts = TryCatch(async (req, res, next)=>{
    const products = await Product.find({})
    return res.status(200).json({
        success: true,
        products
    })
})

export const getProductDetails = TryCatch(async (req, res, next)=>{
    const {id} = req.params
    const product = await Product.findById(id);
    if(!product) return next(new ErrorHandler("Product Not Found!", 404))
    return res.status(200).json({
        success: true,
        product
    })
})

export const updateProduct = TryCatch(async (req, res, next)=>{
    const {id} = req.params
    const photo = req.file
    const {name, category, price, stock, } = req.body
    const product = await Product.findById(id);
    if(!product) return next(new ErrorHandler("Invalid Product Id", 400))

    if(photo){
        rm(product.photo!, ()=>{
            console.log("Old Photo Deleted")
        });
        product.photo = photo.path;
    }
    if(name) product.name = name;
    if(stock) product.stock = stock;
    if(price) product.price = price;
    if(category) product.category = category;

    await product.save()

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    })

}) 

export const deleteProduct = TryCatch(async(req, res, next)=>{
    const {id} = req.params
    
    const product = await Product.findById(id)
    if(!product) return next(new ErrorHandler("Invalid Product Id", 400))

    rm(product.photo!, ()=>{
        console.log("Photo Deleted")
    })
    await product.deleteOne()

    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})
