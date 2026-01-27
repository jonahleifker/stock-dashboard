'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing columns to Users table
    const tableDescription = await queryInterface.describeTable('Users');
    
    if (!tableDescription.username) {
      await queryInterface.addColumn('Users', 'username', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        defaultValue: 'temp_user' // temporary default
      });
      console.log('✓ Added username column');
    }
    
    if (!tableDescription.displayName) {
      await queryInterface.addColumn('Users', 'displayName', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('✓ Added displayName column');
    }
    
    if (!tableDescription.profilePicture) {
      await queryInterface.addColumn('Users', 'profilePicture', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log('✓ Added profilePicture column');
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'profilePicture');
    await queryInterface.removeColumn('Users', 'displayName');
    await queryInterface.removeColumn('Users', 'username');
  }
};
