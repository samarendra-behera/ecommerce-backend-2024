import { json } from "stream/consumers";
import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { calculatePercentage } from "../utils/featuers.js";


export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};

    if(myCache.has('admin-stats')) stats = JSON.parse(myCache.get('admin-stats') as string)
    else{
        const today = new Date();
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders
        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total")
        ])
        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, order) => (total + (order.total || 0)), 0
        )
        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order)=>{return total + (order.total || 0)}, 0
        )
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),
            user: calculatePercentage(
                thisMonthUsers.length,
                lastMonthUsers.length
            ),
            order: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            )
        }
        
        const revenue = allOrders.reduce(
            (total, order) => (total + (order.total || 0)), 0
        )
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length
        }
        

        stats = {
            changePercent,
            count
        }
    }
    return res.status(200).json({
        success: true,
        stats
    })
}) 

export const getPieCharts = TryCatch(async (req, res, next)=>{

})

export const getBarCharts = TryCatch(async (req, res, next)=>{

})

export const getLineCharts = TryCatch(async (req, res, next)=> {

})
