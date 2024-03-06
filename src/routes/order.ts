import express from "express"

import {
    allOrders,
    getOrderDetails,
    myOrders,
    newOrder 
} from '../controllers/order.js'
import { adminOnly } from "../middlewares/auth.js"

const app = express.Router()

// Routes - /api/v1/order/new - To Create new Order
app.post('/new', newOrder)

// Routes - /api/v1/order/my - To Get My Orders
app.get('/my', myOrders)

// Routes - /api/v1/order/all - To Admin See All Orders are placed 
app.get('/all', adminOnly , allOrders)

// Routes - /api/v1/order/:id - To Get Single Order Details
app.route("/:id").get(getOrderDetails)

export default app