const express = require("express");
const userController = require("../Controllers/userController");
const { validatePhone } = require("../utils/phoneValidation");
const userRoutes = express.Router();

userRoutes.post("/signup", validatePhone, userController.signup);
userRoutes.post("/login", validatePhone, userController.login);

userRoutes.use(userController.protect);

userRoutes.get("/logout", userController.logout);

module.exports = userRoutes;
