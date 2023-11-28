const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { InvoiceController } = require("../controllers/invoice.controller");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });

router.get("/", AuthController.requireLogin, InvoiceController.getInvoices);
router.get("/:invoiceid", AuthController.requireLogin, InvoiceController.invoiceDetails);
router.delete("/:invoiceid", AuthController.requireLogin, InvoiceController.deleteInvoice);
router.post("/new", AuthController.requireLogin, InvoiceController.newInvoice);
router.post("/:invoiceid/makepayment", AuthController.requireLogin, InvoiceController.makePayment);

module.exports = {router};