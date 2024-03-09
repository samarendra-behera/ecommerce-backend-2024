import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { calculatePercentage, getChartData } from "../utils/featuers.js";


export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};
    const key = 'admin-stats'

    if (myCache.has(key)) stats = JSON.parse(myCache.get(key) as string)
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
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

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        })

        const productCategoriesCountPromise = Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        const latestOrdersPromise = Order.aggregate([
            { $limit: 4 },
            {
                $project: {
                    status: 1,
                    discount: 1,
                    total: 1,
                    orderItemsCount: { $size: "$orderItems" }
                }
            }
        ])
        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            lastSixMonthOrders,
            productsCount,
            usersCount,
            femaleUserCount,
            allOrders,
            productCategoriesCount,
            latestOrders
        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            lastSixMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            User.find({ gender: "female" }).countDocuments(),
            Order.find({}).select("total"),
            productCategoriesCountPromise,
            latestOrdersPromise
        ])
        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, order) => (total + (order.total || 0)), 0
        )
        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => { return total + (order.total || 0) }, 0
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

        const orderMonthCount = getChartData({
            length: 6,
            docArray: lastSixMonthOrders,
            today
        })
        const orderMonthRevenue = getChartData({
            length: 6,
            docArray: lastSixMonthOrders,
            today,
            property: 'total'
        })

        // Product Inventory logic
        const categoriesCount: Record<string, number>[] = []
        productCategoriesCount.forEach((c) => {
            categoriesCount.push({
                [c._id]: Math.round((c.count / productsCount) * 100)
            })
        })

        // User Ratio logic
        const userRatio = {
            male: usersCount - femaleUserCount,
            female: femaleUserCount
        }

        stats = {
            changePercent,
            count,
            chart: {
                order: orderMonthCount,
                revenue: orderMonthRevenue
            },
            categoriesCount,
            userRatio,
            latestOrders
        }

        myCache.set(key, JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats
    })
})

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts;
    const key = 'admin-pie-charts';
    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    else {

        const orderFulfillmentRatioPromise = Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        const productCategoriesCountPromise = Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: {$sum: 1}
                }
            }
        ])

        const allOrdersPromise = Order.find({}).select([
            "total", 
            "discount",
            "subTotal",
            "tax",
            "shippingCharges"
        ])

        const [
            orderFulfillmentRatio,
            productCategoriesCount,
            productsCount,
            productOutStock,
            allOrders,
            allUsers,
            customerCounts,
            adminCounts
        ] = await Promise.all([
            orderFulfillmentRatioPromise,
            productCategoriesCountPromise,
            Product.countDocuments(),
            Product.countDocuments({stock: 0}),
            allOrdersPromise,
            User.find({}).select('dob'),
            User.countDocuments({role: "user"}),
            User.countDocuments({role: "admin"}),
        ])
        
        // Get Orders FulFillment Ratio
        const orderFulfillment = {
            processing: 0,
            shipped: 0,
            delivered: 0
        }
        orderFulfillmentRatio.forEach(o=>{
            switch (o._id) {
                case "Processing":
                    orderFulfillment.processing = o.count;                    
                    break;
                case "Shipped":
                    orderFulfillment.shipped = o.count;
                    break;
                case "Delivered":
                    orderFulfillment.delivered = o.count;
                    break;
                default:
                    break;
            }
        })

        // Get Products Categories Ratio
        const productCategories:Record<string, number>[] = []
        productCategoriesCount.forEach(c=>{
            productCategories.push({
                [c._id]: c.count
            })
        })

        // Get Stock Availability
        const stock = {
            inStock: productsCount - productOutStock,
            outStock: productOutStock
        }

        // Revenue Distribution
        const grossIncome = allOrders.reduce(
            (prev, order)=>(prev+(order.total || 0)),
            0
        );
        const discount = allOrders.reduce(
            (prev, order) => (prev + (order.discount || 0) ),
            0
        )
        const productionCost = allOrders.reduce(
            (prev, order) => prev + (order.shippingCharges || 0),
            0
        )
        const burnt = allOrders.reduce(
            (prev, order) => prev + (order.tax || 0),
            0
        )
        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost 
        const revenueDistribution = {
            netMargin,
            marketingCost,
            burnt,
            productionCost,
            discount
        }

        // Admin Customer Count
        const adminCustomer = {
            admin: adminCounts,
            user: customerCounts
        }

        // Users Ration according age
        const usersAgeGroup = {
            teen: allUsers.filter(i=>i.age < 20).length,
            adult: allUsers.filter(i=>i.age>=20 && i.age < 40).length,
            old: allUsers.filter(i=>i.age >= 40).length
        }

        charts = {
            orderFulfillment,
            productCategories,
            stock,
            revenueDistribution,
            adminCustomer,
            usersAgeGroup
        }

        myCache.set(key, JSON.stringify(charts))
    }

    res.status(200).json({
        success: true,
        charts
    })
})

export const getBarCharts = TryCatch(async (req, res, next) => {
    let charts;
    const key = 'admin-bar-charts'

    if(myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    else{
        const today = new Date();
        
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        });

        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        });

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $lte: today,
                $gte: twelveMonthAgo
            }
        })

        const [
            sixMonthUsers,
            sixMonthProducts,
            twelveMonthOrders
        ] = await Promise.all([
            sixMonthUsersPromise,
            sixMonthProductsPromise,
            twelveMonthOrdersPromise
        ])
        const user = getChartData({
            length: 6,
            docArray: sixMonthUsers,
            today
        });
        const product = getChartData({
            length: 6,
            docArray: sixMonthProducts,
            today
        });
        const order = getChartData({
            length: 12,
            docArray: twelveMonthOrders,
            today
        })
        charts = {
            user,
            product,
            order
        }
        myCache.set(key, JSON.stringify(charts));
    }

    res.status(200).json({
        success: true,
        charts
    })

})

export const getLineCharts = TryCatch(async (req, res, next) => {
    let charts;
    const key = 'admin-line-charts';

    if(myCache.has(key)) charts = JSON.parse(myCache.get(key) as string)
    else{
        const today = new Date();

        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today
            }
        }
        const [
            twelveMonthUsers,
            twelveMonthProducts,
            twelveMonthOrders
        ] = await Promise.all([
            User.find(baseQuery).select("createdAt"),
            Product.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "total", "discount"])
        ])
        const user = getChartData({
            length: 12,
            docArray: twelveMonthUsers,
            today
        })
        const product = getChartData({
            length: 12,
            docArray: twelveMonthProducts,
            today
        })
        const revenue = getChartData({
            length: 12,
            docArray: twelveMonthOrders,
            today,
            property: "total"
        })

        const discount = getChartData({
            length: 12,
            docArray: twelveMonthOrders,
            today,
            property: "discount"
        })
        charts = {
            user,
            product,
            discount,
            revenue
        }
        myCache.set(key, JSON.stringify(charts));
    }
    res.status(200).json({
        success: true,
        charts
    })
})
