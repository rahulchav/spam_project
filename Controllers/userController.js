const { users, globaldbs, blacklistedtokens } = require("../Models");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apperror");
const { Op } = require("sequelize");
const sequelize = require("../Models").sequelize;

// sign the use id to token
const signToken = (id) =>
  jwt.sign({ id, iat: Math.floor(Date.now() / 1000) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});

// create the send token and send it to response
const createSendToken = (user, statuscode, req, res) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// this will create the new user
exports.signup = catchAsync(async (req, res, next) => {
  const { name, phone, password, email } = req.body;

  if (!name || !phone || !password)
    return next(new AppError("Please provide Phone, Name and password!", 400));

  const userExist = await users.findOne({
    where: { phone },
  });
  if (userExist)
    return res.json({
      message: "Phone number Already registered! Please login",
      userExist: true,
      status: 200,
    });

  const t = await sequelize.transaction();

  const newUser = await users.create(
    {
      name,
      email,
      phone,
      password,
    },
    { transaction: t }
  );

  await globaldbs.destroy({
    where: {
      phone: {
        [Op.eq]: phone,
      },
    },
    transaction: t,
  });

  // Create the new row
  await globaldbs.create(
    {
      phone,
      name,
      userId: newUser.id,
    },
    { transaction: t }
  );

  // Commit the transaction
  await t.commit();

  createSendToken(newUser, 201, req, res);
});

// genearte the token
exports.login = catchAsync(async (req, res, next) => {
  // if varibal name is same as the value then user destructuring
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new AppError("Please provide phone and password!", 400));
  }

  const user = await users.findOne({
    where: { phone },
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect phone or password", 401));
  }

  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  await blacklistedtokens.create({
    token,
    exp: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
  });

  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 get the token and check is its exist or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2 return error if token is not exist
  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access", 401)
    );
  }

  // 3 check for the blacklisted token
  const blackListToken = await blacklistedtokens.findOne({
    where: { token },
  });

  if (blackListToken)
    return next(new AppError("Token blacklisted! Please login again.", 401));

  // 4 dedode and find the user to set it in req.user
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await users.findOne({ where: { id: decoded.id } });
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  req.user = currentUser.toJSON();
  next();
});
