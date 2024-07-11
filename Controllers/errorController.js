const AppError = require("../utils/apperror");

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

const handleJwtError = () =>
  new AppError("Invalid token. please log in again", 401);
const handleJwtExpiredError = () =>
  new AppError("Expired token. please log in again", 401);

const handleDBError = (err) => {
  const message = `Database issue...! ${err.errors?.type}, ${err.errors?.message}`;
  return new AppError("Database issue. Please enter correct values", 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name.startsWith("Sequelize")) error = handleDBError(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();

    sendErrorProd(error, req, res);
  }
};
