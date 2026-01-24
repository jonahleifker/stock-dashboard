
import models from './models'; // Assumes ts-node runs from root
import sequelize from './db/sequelize';

async function cleanup() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Fetching all favorites...');
        const favorites = await models.Favorite.findAll({
            order: [['createdAt', 'ASC']] // Keep oldest
        });

        console.log(`Found ${favorites.length} total favorites.`);

        const seen = new Set<string>();
        const toDelete: number[] = [];

        for (const fav of favorites) {
            const key = `${fav.userId}-${fav.ticker.toUpperCase()}`;
            if (seen.has(key)) {
                console.log(`Marking Duplicate: ID ${fav.id}, Ticker ${fav.ticker}, User ${fav.userId}`);
                toDelete.push(fav.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            console.log(`Deleting ${toDelete.length} duplicates...`);
            await models.Favorite.destroy({
                where: {
                    id: toDelete
                }
            });
            console.log('Duplicates deleted.');
        } else {
            console.log('No duplicates found.');
        }

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await sequelize.close();
    }
}

cleanup();
