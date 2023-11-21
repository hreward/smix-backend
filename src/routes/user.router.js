const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { UserController } = require("../controllers/user.controller");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });

router.get("/", AuthController.requireLogin, UserController.userDetails);
router.post("/update", AuthController.requireLogin, UserController.updateUser);
router.post("/update/avatar", AuthController.requireLogin, upload.single('avatar'), UserController.updateAvatar);

module.exports = {router};