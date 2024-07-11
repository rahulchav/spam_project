const catchAsync = require("../utils/catchAsync");
const { contactlists } = require('../Models');
const AppError = require("../utils/apperror");
const sequelize = require('../Models').sequelize

// add contact no for any user using there id
exports.addContact = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { phone, name } = req.user;

  if(!userId)  return new AppError("Please provide an id in which contact need to be added.",400);

  const t = await sequelize.transaction();

  const contact = await contactlists.findOne({
    where: { userId, phone}
  },{transaction: t})

  if(contact) return next(new AppError("Contact already exists for this user.",400));

  const contactCreated = await contactlists.create({
    phone,
    userId,
    name
  },{transaction: t})

  t.commit()

  res.json(contactCreated)
});

// delete contact no for any user using there id
exports.deleteContact = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { phone } = req.user;

  if(!userId)  return new AppError("Please provide an id in which contact need to be added.",400);

  const t = await sequelize.transaction();

  const contact = await contactlists.findOne({
    where: { userId, phone}
  },{transaction: t})

  if(!contact) return next(new AppError("Contact not found unable to delete.",400));

  const contactDeleted = await contactlists.destroy({
    where:{id: contact.id}
  },{transaction: t})

  t.commit()

  res.json({message: contactDeleted ? "Contact deleted successfully": "Contact not deleted."})
});