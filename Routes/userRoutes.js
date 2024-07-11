const express = require('express');
const userController = require('../Controllers/userController');
const userRoutes = express.Router();

userRoutes.post('/signup', userController.signup);
userRoutes.post('/login', userController.login);

userRoutes.use(userController.protect);

userRoutes.get('/logout', userController.logout);

module.exports = userRoutes;