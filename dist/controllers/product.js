import { TryCatch } from "../middlewares/error.js";
import { Product } from '../models/product.js';
import ErrorHandler from '../utils/utility-class.js';
import { rm } from 'fs';
import { myCache } from '../app.js';
import { invalidateCache } from '../utils/featuers.js';
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, price, sort, category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 10;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i"
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price)
        };
    if (category)
        baseQuery.category = category;
    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === 'asc' ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const [products, filterProducts] = await Promise.all([
        productsPromise,
        Product.find(baseQuery)
    ]);
    const totalPage = Math.ceil(filterProducts.length / limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
});
// Revalidate on New,Update,Delete Product & New Order
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has('latest-products')) {
        products = JSON.parse(myCache.get('latest-products'));
    }
    else {
        products = await Product.find({}).sort({ createAt: -1 }).limit(5);
        myCache.set('latest-products', JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products
    });
});
// Revalidate on New,Update,Delete Product & New Order
export const getProductCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (myCache.has('categories')) {
        categories = JSON.parse(myCache.get('categories'));
    }
    else {
        categories = await Product.distinct("category");
        myCache.set('categories', JSON.stringify(categories));
    }
    return res.status(200).json({
        success: true,
        categories
    });
});
// Revalidate on New,Update,Delete Product & New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has('admin-products')) {
        products = JSON.parse(myCache.get('admin-products'));
    }
    else {
        products = await Product.find({});
        myCache.set('admin-products', JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products
    });
});
// Revalidate on New,Update,Delete Product & New Order
export const getProductDetails = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    let product;
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`));
    }
    else {
        product = await Product.findById(id);
        if (!product)
            return next(new ErrorHandler("Product Not Found!", 404));
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product
    });
});
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, category, stock } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please Add Photo", 400));
    if (!name || !price || !category || !stock) {
        rm(photo.path, () => {
            console.log("Photo Deleted");
        });
        return next(new ErrorHandler("Please add all fields", 400));
    }
    const product = await Product.create({
        name,
        price,
        category: category.toLowerCase(),
        stock,
        photo: photo.path
    });
    invalidateCache({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product Added Successfully",
        product
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const photo = req.file;
    const { name, category, price, stock, } = req.body;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product not Found", 400));
    if (photo) {
        rm(product.photo, () => {
            console.log("Old Photo Deleted");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (stock)
        product.stock = stock;
    if (price)
        product.price = price;
    if (category)
        product.category = category;
    await product.save();
    invalidateCache({ product: true, admin: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Product not Found", 400));
    rm(product.photo, () => {
        console.log("Photo Deleted");
    });
    await product.deleteOne();
    invalidateCache({ product: true, admin: true, productId: id });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    });
});
//# sourceMappingURL=product.js.map