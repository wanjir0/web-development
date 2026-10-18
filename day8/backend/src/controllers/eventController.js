
const db = require('../config/db');

exports.getAllEvents = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM Events ORDER BY date ASC');
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM Events WHERE id = ?', [req.params.id]);
        if (events.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(events[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};