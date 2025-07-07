// update-database-v2.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./schedule.db');

console.log('Altering bookings table to add subjects and price...');

db.serialize(() => {
    // Using a callback to ignore errors if the column already exists
    db.run("ALTER TABLE bookings ADD COLUMN subjects TEXT", () => {});
    db.run("ALTER TABLE bookings ADD COLUMN price REAL", () => {
        console.log('Table altered successfully or columns already exist.');
    });
});

db.close();