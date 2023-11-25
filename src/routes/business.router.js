const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { BusinessController } = require("../controllers/business.controller");
const { SearchController } = require("../controllers/search.controller");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });
const upFiles = upload.fields([{name:"logo"}, {name:"cac"}, {name:"otherdoc"}]);

router.post("/signup", upFiles, BusinessController.createBusiness);
router.get("/get-business/:businessid", AuthController.requireLogin, BusinessController.getBusiness);

module.exports = {router};