'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.public_key_credential, {
        foreignKey: 'user_id', // Foreign key in public_key_credential table
        as: 'public_key_credential' // Alias for the association
      });
    }
  }
  user.init({
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,      
    },
    handle: {  //what is this for?
      type: DataTypes.BLOB,
      allowNull: false
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
    primaryKey: 'user_id', // Define primary key
    sequelize,
    modelName: 'user',
    tableName: 'user', // Ensure the table name matches your database schema
  });
  return user;
};