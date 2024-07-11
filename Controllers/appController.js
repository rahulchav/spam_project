const catchAsync = require("../utils/catchAsync");
const { users , contactlists , globaldbs, spamtransactions } = require('../Models');
const AppError = require("../utils/apperror");
const {Op, Sequelize} = require("sequelize");
const sequelize = require('../Models').sequelize; 


exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  if(!id)  return new AppError("ID key is missing",400);

  const userData = await users.findOne({
    where: { id: id },
    attributes: ['id', 'name', 'phone',"email"]
  })
  res.json(userData)
});

exports.searchKey = catchAsync(async (req, res, next) => {
  const searchString = req.params.key;

  if(!searchString)  return new AppError("Search key is missing",400);

  const userList = await globaldbs.findAll({
    where: {
      [Op.or]: [
        {
          phone: {
            [Op.iLike]: `%${searchString}%`
          },
          // userId: { [Op.ne]: null }
        },
        {
          name: {
            [Op.iLike]: `%${searchString}%`
          }
        }
      ]
    },
    order: [
      [Sequelize.literal(`LEAST(
        NULLIF(POSITION('${searchString}' IN LOWER(name)), 0),
        NULLIF(POSITION('${searchString}' IN LOWER(phone)), 0)
      )`), 'ASC']
    ],
    limit: 20,
    attributes: ['id', 'name', 'phone','userId','spamCount']
  });

  res.json(userList)
});


exports.makeContactSpam = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { phone } = req.body;

  if(!id)  return next(new AppError("User ID missing to mark as spam",400));
  if(!phone)  return next(new AppError("Phone no. missing to mark as spam",400));

  const userList = await spamtransactions.findOne({
    where: {userId : id, phone : phone}
  });


  if(userList) return res.json({message: "You already Marked This contact as spam", spamTransactionExists: true,status : 200});

  const t = await sequelize.transaction();

  const spamTransactionNew = 
  await spamtransactions.create({
    userId : id,
    phone
  },{transaction: t});

  await globaldbs.increment({ spamCount: 1 },{where: {phone}},{transaction: t});

  t.commit()

  res.json(spamTransactionNew)
});


exports.searchUserDetail = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const { phone } = req.user;

  if(!id)  return next(new AppError("User ID missing to get user",400));
  if(!phone)  return next(new AppError("Phone missing to check email visibilty",400));

  const t = await sequelize.transaction();

  const user =  await users.findOne({
    where: { id },
    attributes:["id", "phone", "name", "email"]
  },{transaction:t})

  const userData = user.toJSON()

  if(userData.email){
    const contactExist = await contactlists.findOne({where: { userId :id, phone}
    },{transaction:t})
    if(!contactExist) delete userData.email;
  }

  t.commit()

  res.json(userData)
});