const express = require("express");
const { AuthController } = require("../controllers/auth.controller");
const { AnalyticsController } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/", AuthController.requireLogin, AnalyticsController.getAnalytics);
router.get("/revenue", AuthController.requireLogin, AnalyticsController.getTotalRevenue);

module.exports = {router};