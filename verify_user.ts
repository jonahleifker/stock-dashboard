import models from './models';
import { initializeDatabase } from './db/init';

async function verifyUser() {
    await initializeDatabase();
    const user = await models.User.findByPk(1);
    if (user) {
        console.log('User 1 exists:', user.username);
    } else {
        console.log('User 1 does NOT exist. Creating...');
        await models.User.create({
            id: 1,
            username: 'jonah',
            email: 'jonahleifker@gmail.com',
            displayName: 'Jonah Leifker',
            passwordHash: 'mock_hash', // invalid hash, but doesn't matter for mock
            isActive: true
        });
        console.log('User 1 created.');
    }
    process.exit(0);
}

verifyUser();
