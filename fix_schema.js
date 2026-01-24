
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./var/dev.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database.');
});

db.serialize(() => {
    console.log('Adding profilePicture column...');
    db.run("ALTER TABLE Users ADD COLUMN profilePicture TEXT;", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column added successfully.');
        }
    });
});

db.close();
