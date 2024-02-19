import express from "express";
import {connectDB} from "./utils/featuers.js"

// Importing Routes
import userRoutes from './routes/user.js'
import { errorMiddleware } from "./middlewares/error.js";

const port = 4500
const host = '127.0.0.1'

connectDB()

const app = express()

app.use(express.json())

app.get('/', (req, res)=>{
    res.send("API Working with /api/v1")
})

// Using Routes
app.use("/api/v1/user", userRoutes)

app.use(errorMiddleware)

app.listen(port,()=>{
    console.log(`Express is working on http://${host}:${port}`)
})