'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = [
            { name: 'pe', type: Sequelize.FLOAT },
            { name: 'peg', type: Sequelize.FLOAT },
            { name: 'eps', type: Sequelize.FLOAT },
            { name: 'dividendYield', type: Sequelize.FLOAT },
            { name: 'roe', type: Sequelize.FLOAT },
            { name: 'netMargin', type: Sequelize.FLOAT },
            { name: 'operatingMargin', type: Sequelize.FLOAT },
            { name: 'cash', type: Sequelize.FLOAT },
            { name: 'totalDebt', type: Sequelize.FLOAT },
            { name: 'earningsDate', type: Sequelize.DATE },
            { name: 'exDividendDate', type: Sequelize.DATE },
            { name: 'targetPrice', type: Sequelize.FLOAT },
            { name: 'recommendation', type: Sequelize.STRING },
            { name: 'description', type: Sequelize.TEXT },
            { name: 'website', type: Sequelize.STRING },
            { name: 'employees', type: Sequelize.INTEGER },
            { name: 'news', type: Sequelize.JSON },
        ];

        for (const column of columns) {
            await queryInterface.addColumn('stocks', column.name, {
                type: column.type,
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const columns = [
            'pe', 'peg', 'eps', 'dividendYield', 'roe', 'netMargin', 'operatingMargin',
            'cash', 'totalDebt', 'earningsDate', 'exDividendDate', 'targetPrice',
            'recommendation', 'description', 'website', 'employees', 'news'
        ];

        for (const column of columns) {
            await queryInterface.removeColumn('stocks', column);
        }
    }
};
