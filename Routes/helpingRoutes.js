const express = require("express");
const userController = require("../Controllers/userController");
const helpingController = require("../Controllers/helpingController");
const helpingRoutes = express.Router();

helpingRoutes.use(userController.protect);

helpingRoutes.post("/add-contact", helpingController.addContact);
helpingRoutes.post("/delete-contact", helpingController.deleteContact);

module.exports = helpingRoutes;
