// set-availability.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./schedule.db');

// --- Customize Your Schedule Here ---
// Example: Mon-Fri, 9am-12pm and 1pm-5pm.
// day_of_week: 0=Sun, 1=Mon, 2=Tues, 3=Weds, 4=Thurs, 5=Fri, 6=Sat
const mySchedule = [
    { day_of_week: 1, start_time: '09:00', end_time: '12:00' }, // Monday Morning
    { day_of_week: 1, start_time: '13:00', end_time: '17:00' }, // Monday Afternoon
    { day_of_week: 2, start_time: '09:00', end_time: '12:00' }, // Tuesday Morning
    { day_of_week: 2, start_time: '13:00', end_time: '17:00' }, // Tuesday Afternoon
    { day_of_week: 3, start_time: '09:00', end_time: '12:00' }, // Wednesday Morning
    { day_of_week: 3, start_time: '13:00', end_time: '17:00' }, // Wednesday Afternoon
    { day_of_week: 4, start_time: '09:00', end_time: '12:00' }, // Thursday Morning
    { day_of_week: 4, start_time: '13:00', end_time: '17:00' }, // Thursday Afternoon
    { day_of_week: 5, start_time: '09:00', end_time: '12:00' }, // Friday Morning
    { day_of_week: 5, start_time: '13:00', end_time: '17:00' }, // Friday Afternoon
];

const stmt = db.prepare("INSERT INTO availability (day_of_week, start_time, end_time) VALUES (?, ?, ?)");

// Clear the old schedule before inserting the new one.
db.run("DELETE FROM availability", (err) => {
    if (err) return console.error(err.message);
    console.log('Cleared old availability.');
    
    mySchedule.forEach(slot => {
        stmt.run(slot.day_of_week, slot.start_time, slot.end_time);
    });
    
    stmt.finalize((err) => {
        if (err) return console.error(err.message);
        console.log('Successfully updated availability.');
    });
});

db.close();