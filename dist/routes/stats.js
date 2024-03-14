import express from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts, } from '../controllers/stats.js';
const app = express.Router();
// routes - /api/v1/dashboard/stats
app.get('/stats', adminOnly, getDashboardStats);
// routes - /api/v1/dashboard/pie
app.get('/pie', adminOnly, getPieCharts);
// routes - /api/v1/dashboard/bar
app.get('/bar', adminOnly, getBarCharts);
// routes - /api/v1/dashboard/line
app.get('/line', adminOnly, getLineCharts);
export default app;
//# sourceMappingURL=stats.js.map