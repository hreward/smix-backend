const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { TransactionController } = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/", AuthController.requireLogin, TransactionController.getTransactions);

module.exports = {router};