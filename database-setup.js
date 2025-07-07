// database-setup.js
const sqlite3 = require('sqlite3').verbose();

// This creates a new database file named 'schedule.db'.
const db = new sqlite3.Database('./schedule.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the schedule.db database.');
});

// This command ensures commands are run one after another.
db.serialize(() => {
    // Create the 'availability' table to store your general working hours.
    db.run(`
        CREATE TABLE IF NOT EXISTS availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_of_week INTEGER NOT NULL, -- 0=Sun, 1=Mon, 2=Tues, etc.
            start_time TEXT NOT NULL,     -- Format 'HH:MM' (e.g., '09:00')
            end_time TEXT NOT NULL        -- Format 'HH:MM' (e.g., '17:00')
        );
    `, (err) => {
        if (err) console.error('Error creating availability table:', err.message);
        else console.log('Availability table created or already exists.');
    });

    // Create the 'bookings' table to store confirmed appointments.
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_datetime TEXT NOT NULL UNIQUE, -- ISO 8601 format, ensures no double booking
            client_name TEXT,
            client_email TEXT,
            status TEXT DEFAULT 'pending'          -- e.g., 'pending', 'confirmed'
        );
    `, (err) => {
        if (err) console.error('Error creating bookings table:', err.message);
        else console.log('Bookings table created or already exists.');
    });
});

// Close the connection to the database file.
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});