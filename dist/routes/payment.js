import express from 'express';
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, newCoupon, } from '../controllers/payment.js';
import { adminOnly } from '../middlewares/auth.js';
const app = express.Router();
// route - /api/v1/payment/create  -> Create Payment Indent
app.post('/create', createPaymentIntent);
// route - /api/v1/payment/discount  -> Apply coupon Code
app.get('/discount', applyDiscount);
// route - /api/v1/payment/coupon/new  -> Create New Coupon (Admin)
app.post('/coupon/new', adminOnly, newCoupon);
// route - /api/v1/payment/coupon/all  -> Get All Coupons (Admin)
app.get('/coupon/all', adminOnly, allCoupons);
// route - /api/v1/payment/coupon/:id  -> Get All Coupons (Admin)
app.delete('/coupon/:id', adminOnly, deleteCoupon);
export default app;
