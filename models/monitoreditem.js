'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class monitoredItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.monitoredItems.belongsTo(models.item)
      models.monitoredItems.belongsTo(models.connectedRealm)
      models.monitoredItems.belongsTo(models.user)
    }
  };
  monitoredItem.init({
    itemId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    connectedRealmId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'monitoredItem',
  });
  return monitoredItem;
};