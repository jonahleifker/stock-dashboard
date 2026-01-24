
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./var/dev.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database.');
});

db.serialize(() => {
    // 1. Check schema of Users table
    console.log('\n--- Schema of Users table ---');
    db.all("PRAGMA table_info(Users)", (err, rows) => {
        if (err) console.error('Error getting schema:', err);
        else console.table(rows);
    });

    // 2. Check if user exists
    console.log('\n--- Users ---');
    db.all("SELECT id, username, email FROM Users WHERE email = 'jonahleifker@gmail.com'", (err, rows) => {
        if (err) console.error('Error getting users:', err);
        else console.log(rows);
    });

});

db.close();
