
const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const auth = require('../middleware/auth');

router.get('/:eventId/seats', seatController.getSeats);
router.post('/reserve', auth, seatController.reserveSeats);
router.delete('/release/:seatId', auth, seatController.releaseSeat);
router.post('/checkout', auth, seatController.checkout);

module.exports = router;
