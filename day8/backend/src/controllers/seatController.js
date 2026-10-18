const db = require('../config/db');

exports.getSeats = async (req, res) => {
    const { eventId } = req.params;
    try {
        const [seats] = await db.query(
            'SELECT id, row_label, seat_number, status FROM Seats WHERE event_id = ? ORDER BY row_label, seat_number',
            [eventId]
        );
        res.json(seats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
};

exports.reserveSeats = async (req, res) => {
    const { seatIds } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // PESSIMISTIC LOCK: Prevents double-booking
        const [lockedSeats] = await connection.query(
            'SELECT id, status FROM Seats WHERE id IN (?) FOR UPDATE',
            [seatIds]
        );

        const unavailable = lockedSeats.filter(s => s.status !== 'available');
        if (unavailable.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                error: 'Some seats are no longer available',
                unavailableIds: unavailable.map(s => s.id)
            });
        }

        const reservedUntil = new Date(Date.now() + 10 * 60 * 1000);
        await connection.query(
            'UPDATE Seats SET status = ?, reserved_by_user_id = ?, reserved_until = ? WHERE id IN (?)',
            ['reserved', userId, reservedUntil, seatIds]
        );

        await connection.commit();
        res.json({ success: true, message: 'Seats reserved for 10 minutes' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Reservation failed' });
    } finally {
        connection.release();
    }
};

exports.releaseSeat = async (req, res) => {
    const { seatId } = req.params;
    const userId = req.user.id;

    try {
        const [result] = await db.query(
            'UPDATE Seats SET status = ?, reserved_by_user_id = NULL, reserved_until = NULL WHERE id = ? AND reserved_by_user_id = ?',
            ['available', seatId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Seat not found or not reserved by you' });
        }

        res.json({ success: true, message: 'Seat released' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to release seat' });
    }
};

exports.checkout = async (req, res) => {
    const { seatIds } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [lockedSeats] = await connection.query(
            'SELECT id, event_id, status, reserved_by_user_id FROM Seats WHERE id IN (?) FOR UPDATE',
            [seatIds]
        );

        const invalidSeats = lockedSeats.filter(s => s.status !== 'reserved' || s.reserved_by_user_id !== userId);
        if (invalidSeats.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Invalid or expired seats in cart' });
        }

        const eventId = lockedSeats[0].event_id;
        const totalPrice = lockedSeats.length * 50.00;

        const [orderResult] = await connection.query(
            'INSERT INTO Orders (user_id, event_id, total_price, status) VALUES (?, ?, ?, ?)',
            [userId, eventId, totalPrice, 'completed']
        );

        await connection.query(
            'UPDATE Seats SET status = ?, reserved_by_user_id = NULL, reserved_until = NULL WHERE id IN (?)',
            ['sold', seatIds]
        );

        await connection.commit();
        res.json({ success: true, orderId: orderResult.insertId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Checkout failed' });
    } finally {
        connection.release();
    }
};