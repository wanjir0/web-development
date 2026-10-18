import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/useCart';

const SeatMap = ({ eventId }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        let isMounted = true;

        const fetchSeats = async () => {
            try {
                const res = await api.get(`/${eventId}/seats`);
                if (isMounted) {
                    setSeats(res.data);
                }
            } catch (err) {
                console.error('Failed to load seats:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchSeats();

        return () => {
            isMounted = false;
        };
    }, [eventId]);

    const handleSeatClick = async (seat) => {
        if (seat.status !== 'available') return;

        setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: 'pending' } : s));

        await addToCart(seat);

        try {
            const res = await api.get(`/${eventId}/seats`);
            setSeats(res.data);
        } catch (err) {
            console.error('Failed to refresh seats after selection:', err);
        }
    };

    if (loading) return <p className="seat-map__loading">Loading seat map...</p>;

    const rows = seats.reduce((acc, seat) => {
        if (!acc[seat.row_label]) acc[seat.row_label] = [];
        acc[seat.row_label].push(seat);
        return acc;
    }, {});

    return (
        <div className="seat-map">
            <h2 className="seat-map__title">Select Your Seats</h2>

            <div className="stage">🎤 STAGE</div>

            {Object.entries(rows).sort().map(([row, rowSeats]) => (
                <div key={row} className="seat-row">
                    <span className="seat-row__label">{row}</span>
                    {rowSeats.sort((a, b) => a.seat_number - b.seat_number).map(seat => (
                        <button
                            key={seat.id}
                            className={`seat seat--${seat.status}`}
                            disabled={seat.status !== 'available'}
                            onClick={() => handleSeatClick(seat)}
                        >
                            {seat.seat_number}
                        </button>
                    ))}
                </div>
            ))}

            <div className="seat-map__legend">
                <div className="legend-item">
                    <div className="legend-box legend-box--available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box legend-box--reserved"></div>
                    <span>Your Selection</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box legend-box--sold"></div>
                    <span>Sold Out</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box legend-box--pending"></div>
                    <span>Processing</span>
                </div>
            </div>
        </div>
    );
};

export default SeatMap;