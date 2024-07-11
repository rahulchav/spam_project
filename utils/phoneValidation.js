const AppError = require("./apperror");

function validatePhoneNumber(phoneNumber) {
  // Regular expression for a generic phone number validation
  const phoneRegex = /^[0-9]{10}$/;

  if (phoneRegex.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
}

exports.validatePhone = function (req, res, next) {
  const { phone } = req.body;

  if (!phone) return next();

  if (validatePhoneNumber(phone)) {
    return next();
  } else {
    return next(new AppError("Please enter a valid phone number", 400));
  }
};
