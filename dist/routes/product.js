import express from 'express';
import { deleteProduct, getAdminProducts, getAllProducts, getProductCategories, getProductDetails, getlatestProducts, newProduct, updateProduct } from '../controllers/product.js';
import { adminOnly } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';
const app = express.Router();
// Routes - /api/v1/product/new
app.post('/new', adminOnly, singleUpload, newProduct);
// Routes - /api/v1/product/all
app.get('/all', getAllProducts);
// Routes - /api/v1/product/latest
app.get('/latest', getlatestProducts);
// Routes - /api/v1/product/categories
app.get('/categories', getProductCategories);
// Routes - /api/v1/product/admin-products
app.get('/admin-products', adminOnly, getAdminProducts);
// Routes - /api/v1/product/:id 
app.route('/:id').get(getProductDetails)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default app;
