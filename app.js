const express = require('express');
const dotenv = require('dotenv');
const app = express();
const db = require("./Models");
const { users , contactlists } = require('./Models');
const appRoutes = require('./Routes/appRoutes');
const AppError = require('./utils/apperror');
const userRoutes = require('./Routes/userRoutes');
const PORT = process.env.PORT || 8000

dotenv.config({ path: './config.env' });

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/app', appRoutes);
app.use('/api/user', userRoutes);

db.sequelize.sync().then((req) => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})


app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   staus: 'fail',
  //   message: `cant find the ${req.originalUrl} on the server`,
  // });

  next(new AppError(`cant find the ${req.originalUrl} on the server`, 404));
});
const sendErrorDev = (err, req, res) => {
  // console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

app.use((err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } 
  // else if (process.env.NODE_ENV === 'production') {
  //   let error = { ...err, name: err.name, message: err.message };

  //   if (error.name === 'CastError') error = handleCastErrorDB(error);
  //   if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  //   if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  //   if (error.name === 'JsonWebTokenError') error = handleJwtError();
  //   if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();
  //   //
  //   // sendErrorProd(error, req, res);
  // }
})