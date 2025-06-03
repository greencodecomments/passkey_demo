'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class public_key_credential extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: 'user_id', // Foreign key in public_key_credential table
        as: 'user' // Alias for the association
      });
    }
  }
  public_key_credential.init({
    public_key_credential_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    public_key: DataTypes.STRING,
    external_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure external_id is unique
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    primaryKey: 'public_key_credential_id', // Define primary key
    sequelize,
    modelName: 'public_key_credential',
    tableName: 'public_key_credential', // Ensure the table name matches your database schema
  });
  return public_key_credential;
};