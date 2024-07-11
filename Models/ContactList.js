module.exports = (sequelize, DataTypes) => {
  const contactlists = sequelize.define('contactlists', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  contactlists.associate = (models) => {
    contactlists.belongsTo(models.users, { foreignKey: 'userId' });
  };

  return contactlists;
};
