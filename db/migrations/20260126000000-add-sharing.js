'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add visibility column to notes table
    await queryInterface.addColumn('notes', 'visibility', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'private',
      comment: 'Values: private, shared, public'
    });

    // Add visibility column to research_files table
    await queryInterface.addColumn('research_files', 'visibility', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'private',
      comment: 'Values: private, shared, public'
    });

    // Create shared_notes junction table
    await queryInterface.createTable('shared_notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      noteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'notes',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedWithUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create shared_files junction table
    await queryInterface.createTable('shared_files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      fileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'research_files',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedWithUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sharedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('shared_notes', ['sharedWithUserId'], {
      name: 'idx_shared_notes_sharedWith'
    });
    await queryInterface.addIndex('shared_notes', ['noteId'], {
      name: 'idx_shared_notes_noteId'
    });
    await queryInterface.addIndex('shared_files', ['sharedWithUserId'], {
      name: 'idx_shared_files_sharedWith'
    });
    await queryInterface.addIndex('shared_files', ['fileId'], {
      name: 'idx_shared_files_fileId'
    });

    // Add unique constraints to prevent duplicate shares
    await queryInterface.addConstraint('shared_notes', {
      fields: ['noteId', 'sharedWithUserId'],
      type: 'unique',
      name: 'unique_note_share'
    });
    await queryInterface.addConstraint('shared_files', {
      fields: ['fileId', 'sharedWithUserId'],
      type: 'unique',
      name: 'unique_file_share'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables
    await queryInterface.dropTable('shared_files');
    await queryInterface.dropTable('shared_notes');

    // Remove columns
    await queryInterface.removeColumn('research_files', 'visibility');
    await queryInterface.removeColumn('notes', 'visibility');
  }
};
