const express = require("express");
const appController = require("../Controllers/appController");
const userController = require("../Controllers/userController");
const { validatePhone } = require("../utils/phoneValidation");
const queryRoutes = express.Router();

queryRoutes.use(userController.protect);

queryRoutes.get("/search/:key", appController.searchKey);
queryRoutes.get("/user-me", appController.getUser);
queryRoutes.post("/mark-spam", validatePhone, appController.makeContactSpam);
queryRoutes.post("/userDetail", appController.searchUserDetail);

module.exports = queryRoutes;
