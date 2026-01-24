'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // First, ensure the Users table exists (may be uppercase or lowercase)
        const tables = await queryInterface.showAllTables();
        const usersTableName = tables.includes('Users') ? 'Users' : 'users';

        // Create watchlist table
        await queryInterface.createTable('watchlist', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: usersTableName,
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            ticker: {
                type: Sequelize.STRING,
                allowNull: false,
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

        // Create unique index on userId + ticker combination
        await queryInterface.addIndex('watchlist', ['userId', 'ticker'], {
            unique: true,
            name: 'watchlist_user_ticker_unique'
        });

        // Create individual indexes for query performance
        await queryInterface.addIndex('watchlist', ['userId']);
        await queryInterface.addIndex('watchlist', ['ticker']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('watchlist');
    }
};
