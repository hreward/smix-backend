const express = require("express");
const { AuthController} = require("../controllers/auth.controller");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });


router.post("/signin", AuthController.login);
router.get("/logout", AuthController.requireLogin, AuthController.logout);

router.post("/requestnewemailcode", AuthController.requestEmailCode);
router.post("/verifyemailcode", AuthController.verifyEmailCode);

router.post("/requestnewpassword", AuthController.requestPasswordChange);
router.post("/changepassword", AuthController.changePassword);


module.exports = {router};