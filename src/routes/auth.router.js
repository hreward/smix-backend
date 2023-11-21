const express = require("express");
const { AuthController} = require("../controllers/auth.controller");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });


// router.post('/', AuthController.createWallet);
router.put("/newuser/signup", AuthController.newUser);
router.post("/newuser/check/email", AuthController.checkEmail);
router.post("/newuser/check/phone", AuthController.checkPhone);
// router.post("/verify/otp", AuthController.verifyOTP);

router.post("/login", AuthController.login);
router.get("/logout", AuthController.requireLogin, AuthController.logout);

router.post("/requestnewemailcode", AuthController.requestEmailCode);
router.post("/verifyemailcode", AuthController.verifyEmailCode);

router.post("/requestnewpassword", AuthController.requestPasswordChange);
router.post("/changepassword", AuthController.changePassword);

router.post("/newfeedback", AuthController.requireLogin, upload.single('pageimage'), AuthController.createFeedback);

module.exports = {router};