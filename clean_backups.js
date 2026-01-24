import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./var/dev.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Cleaning up backup tables in ' + dbPath);

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS Users_backup", (err) => {
        if (err) console.error("Error dropping Users_backup:", err);
        else console.log("Dropped Users_backup (if it existed)");
    });

    db.run("DROP TABLE IF EXISTS stocks_backup", (err) => {
        if (err) console.error("Error dropping stocks_backup:", err);
        else console.log("Dropped stocks_backup (if it existed)");
    });
});

db.close();
