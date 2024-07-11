module.exports = (sequelize, DataTypes) => {
  const blacklistedtokens = sequelize.define("blacklistedtokens", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return blacklistedtokens;
};
