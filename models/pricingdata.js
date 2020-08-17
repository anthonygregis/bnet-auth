'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pricingData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.pricingdata.hasMany(models.item)
      models.pricingdata.hasMany(models.connectedrealm)
    }
  };
  pricingData.init({
    buyout: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pricingData',
  });
  return pricingData;
};