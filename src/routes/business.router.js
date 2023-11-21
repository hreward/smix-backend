const express = require("express");
const multer = require("multer");
const { AuthController } = require("../controllers/auth.controller");
const { CoopController } = require("../controllers/business.controller");
const { SearchController } = require("../controllers/search.controller");

const router = express.Router();
const upload = multer({ dest: 'tmps/uploads/', limits: {fieldSize: 1048576}, preservePath: true });
const upFiles = upload.fields([{name:"logo"}, {name:"cac"}, {name:"otherdoc"}]);

router.post("/create", AuthController.requireLogin, upFiles, CoopController.createCoop);
router.get("/get-coops", AuthController.requireLogin, CoopController.getUserCoops);
router.get("/get-coop/:coopid", AuthController.requireLogin, CoopController.getCoop);
router.post("/join/:coopid", AuthController.requireLogin, CoopController.joinCoop);
router.post("/contribute/:coopid", AuthController.requireLogin, CoopController.makeContribution);
router.post("/autosave-settings/:coopid", AuthController.requireLogin, CoopController.setAutosave);
router.post("/leave/:coopid", AuthController.requireLogin, CoopController.leaveCoop);
router.post("/cancelrequest/:coopid", AuthController.requireLogin, CoopController.cancelMembershipRequest);
router.get("/search/:search/:more?", AuthController.requireLogin, SearchController.searchByString);
router.get("/explore/:more?", AuthController.requireLogin, SearchController.exploreCoops);

module.exports = {router};