'use strict';

const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [adminRoleId, userRoleId] = [randomUUID(), randomUUID()];
    const [usersReadId, usersWriteId, rolesReadId, rolesWriteId] = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
    ];

    await queryInterface.bulkInsert('Roles', [
      { id: adminRoleId, name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { id: userRoleId, name: 'user', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('Permissions', [
      { id: usersReadId, name: 'users.read', createdAt: new Date(), updatedAt: new Date() },
      { id: usersWriteId, name: 'users.write', createdAt: new Date(), updatedAt: new Date() },
      { id: rolesReadId, name: 'roles.read', createdAt: new Date(), updatedAt: new Date() },
      { id: rolesWriteId, name: 'roles.write', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('RolePermissions', [
      { roleId: adminRoleId, permissionId: usersReadId, createdAt: new Date(), updatedAt: new Date() },
      { roleId: adminRoleId, permissionId: usersWriteId, createdAt: new Date(), updatedAt: new Date() },
      { roleId: adminRoleId, permissionId: rolesReadId, createdAt: new Date(), updatedAt: new Date() },
      { roleId: adminRoleId, permissionId: rolesWriteId, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    // Don't specify ID - let it auto-increment

    await queryInterface.bulkInsert('Users', [
      { email: adminEmail, passwordHash, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    
    // Get the auto-generated ID
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = ?`,
      { replacements: [adminEmail], type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const adminUserId = adminUser.id;

    await queryInterface.bulkInsert('UserRoles', [
      { userId: adminUserId, roleId: adminRoleId, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('UserRoles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
