import express from "express";
import NodeCache from "node-cache";
import {connectDB} from "./utils/featuers.js"
import { errorMiddleware } from "./middlewares/error.js";

// Importing Routes
import userRoutes from './routes/user.js'
import productRoutes from './routes/product.js'
import { NoEmitOnErrorsPlugin } from "webpack";


const port = 4500
const host = '127.0.0.1'

connectDB()

export const myCache = new NodeCache()

const app = express()

app.use(express.json())

app.get('/', (req, res)=>{
    res.send("API Working with /api/v1")
})

// Using Routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/product", productRoutes)

app.use("/uploads", express.static("uploads"))
app.use(errorMiddleware)

app.listen(port,()=>{
    console.log(`Express is working on http://${host}:${port}`)
})