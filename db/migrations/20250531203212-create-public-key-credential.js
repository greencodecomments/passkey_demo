'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('public_key_credential', {
      public_key_credential_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user', // Reference to the user table
          key: 'user_id' // Foreign key in the user table
        },
      },
      public_key: {
        type: Sequelize.STRING
      },
      external_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true // Ensure external_id is unique
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Ensure updatedAt has a default value
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Ensure updatedAt has a default value
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('public_key_credential');
  }
};