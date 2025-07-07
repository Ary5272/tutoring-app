// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4242;

app.use(express.static('public'));
app.use(express.json());

const db = new sqlite3.Database('./schedule.db');

// This endpoint for getting slots remains unchanged.
app.get('/api/available-slots', (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'A date query parameter is required.' });
    }
    
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const sessionDuration = 60;

    db.all("SELECT start_time, end_time FROM availability WHERE day_of_week = ?", [dayOfWeek], (err, workBlocks) => {
        if (err) {
            console.error('Error fetching availability:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!workBlocks.length) {
            return res.json([]);
        }

        db.all("SELECT session_datetime FROM bookings WHERE date(session_datetime) = ?", [date], (err, bookedSlots) => {
            if (err) {
                console.error('Error fetching bookings:', err);
                return res.status(500).json({ error: err.message });
            }

            const bookedTimes = bookedSlots.map(slot => new Date(slot.session_datetime).toISOString());
            const availableSlots = [];

            workBlocks.forEach(block => {
                const start = new Date(`${date}T${block.start_time}:00Z`);
                const end = new Date(`${date}T${block.end_time}:00Z`);
                let currentSlot = new Date(start);

                while (currentSlot < end) {
                    const slotEndTime = new Date(currentSlot.getTime() + sessionDuration * 60000);
                    if (slotEndTime > end) break;

                    const slotISO = currentSlot.toISOString();
                    if (!bookedTimes.includes(slotISO)) {
                        availableSlots.push(slotISO);
                    }
                    currentSlot = slotEndTime;
                }
            });
            res.json(availableSlots);
        });
    });
});

// UPDATED endpoint to handle a booking request with subjects and price
app.post('/request-booking', (req, res) => {
    // Now accepting subjects and price from the request
    const { timeSlot, name, email, subjects, price } = req.body;

    if (!timeSlot || !name || !email || !subjects || price === undefined) {
        return res.status(400).json({ error: 'Missing required booking information.' });
    }

    // The subjects array will be joined into a single string for storage
    const subjectsString = subjects.join(', ');
    const sql = "INSERT INTO bookings (session_datetime, client_name, client_email, status, subjects, price) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [timeSlot, name, email, 'pending', subjectsString, price];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Database error on booking:", err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Sorry, this time slot was just booked by someone else. Please select another time.' });
            }
            return res.status(500).json({ error: 'Could not process your booking. Please try again.' });
        }
        res.status(201).json({ success: true, bookingId: this.lastID });
    });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));