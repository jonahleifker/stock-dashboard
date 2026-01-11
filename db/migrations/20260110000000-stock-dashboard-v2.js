'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if Users table exists
    const tables = await queryInterface.showAllTables();
    const usersExists = tables.includes('Users') || tables.includes('users');
    
    if (!usersExists) {
      // Create users table from scratch with INTEGER ID
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        passwordHash: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        displayName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        lastLoginAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    } else {
      // Add columns to existing Users table
      const usersTableInfo = await queryInterface.describeTable('Users');
      
      if (!usersTableInfo.username) {
        await queryInterface.addColumn('Users', 'username', {
          type: Sequelize.STRING,
          allowNull: true,
          // Don't add unique constraint during column addition - SQLite doesn't support it
        });
        
        // Create unique index separately instead
        try {
          await queryInterface.addIndex('Users', ['username'], {
            unique: true,
            name: 'users_username_unique'
          });
        } catch (error) {
          // Index might already exist, ignore error
          console.log('Username index already exists or failed to create');
        }
      }
      
      if (!usersTableInfo.displayName) {
        await queryInterface.addColumn('Users', 'displayName', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }

    // Create stocks table
    await queryInterface.createTable('stocks', {
      ticker: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currentPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      high30d: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      high3mo: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      high6mo: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      high1yr: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      change7d: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      change30d: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      change90d: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      marketCap: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create notes table
    await queryInterface.createTable('notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticker: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'stocks',
          key: 'ticker',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bullCase: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bearCase: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      buyInPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      currentStance: {
        type: Sequelize.ENUM('bullish', 'bearish', 'neutral'),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create articles table
    await queryInterface.createTable('articles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticker: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'stocks',
          key: 'ticker',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sourceName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      addedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create research_files table
    await queryInterface.createTable('research_files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticker: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'stocks',
          key: 'ticker',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      supabasePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      source: {
        type: Sequelize.ENUM('manual', 'manus'),
        allowNull: true,
        defaultValue: 'manual',
      },
      uploadedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for better query performance
    await queryInterface.addIndex('notes', ['ticker']);
    await queryInterface.addIndex('notes', ['userId']);
    await queryInterface.addIndex('articles', ['ticker']);
    await queryInterface.addIndex('articles', ['userId']);
    await queryInterface.addIndex('research_files', ['ticker']);
    await queryInterface.addIndex('research_files', ['userId']);
  },

  async down(queryInterface) {
    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('research_files');
    await queryInterface.dropTable('articles');
    await queryInterface.dropTable('notes');
    await queryInterface.dropTable('stocks');

    // Remove columns from Users table
    const usersTableInfo = await queryInterface.describeTable('Users');
    
    if (usersTableInfo.username) {
      await queryInterface.removeColumn('Users', 'username');
    }
    
    if (usersTableInfo.displayName) {
      await queryInterface.removeColumn('Users', 'displayName');
    }
  }
};
