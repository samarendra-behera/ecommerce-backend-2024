import express from "express";
import cors from "cors";
import NodeCache from "node-cache";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from 'url';
import { config } from "dotenv";
import morgan from "morgan";
import swaggerDocument from './swagger.json' assert { type: "json" };
import { connectDB } from "./utils/featuers.js";
import { errorMiddleware } from "./middlewares/error.js";
// Importing Routes
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import dashboardRoutes from './routes/stats.js';
import Stripe from "stripe";
config({
    path: "./.env",
});
const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
export const upload_path = path.join(__dirname, "../", "uploads");
const port = process.env.PORT || 45000;
const mongoUrl = process.env.MONGO_URL || "";
const stripeKey = process.env.STRIPE_KEY || "";
connectDB(mongoUrl);
export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.get('/', (req, res) => {
    res.send("API Working with /api/v1");
});
// Using Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/uploads", express.static(upload_path));
app.use(errorMiddleware);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
    console.log(`Express is working on port ${port}`);
});
export default app;
