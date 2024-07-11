module.exports = (sequelize, DataTypes) => {
  const spamtransactions = sequelize.define("spamtransactions", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  spamtransactions.associate = (models) => {
    spamtransactions.belongsTo(models.users, { foreignKey: "userId" });
  };

  return spamtransactions;
};
