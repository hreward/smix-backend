const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { ClientController } = require("../controllers/client.controller");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });

router.get("/", AuthController.requireLogin, ClientController.getClients);
router.get("/:clientid", AuthController.requireLogin, ClientController.clientDetails);
router.delete("/:clientid", AuthController.requireLogin, ClientController.deleteClient);
router.patch("/:clientid", AuthController.requireLogin, ClientController.restoreClient);
router.post("/new", AuthController.requireLogin, upload.single('avatar'), ClientController.newClient);
router.post("/update", AuthController.requireLogin, upload.single('avatar'), ClientController.updateClient);

module.exports = {router};