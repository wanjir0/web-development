import SeatMap from '../components/SeatMap';
import Cart from '../components/Cart';

const EventPage = () => {
    const eventId = 1; 

    return (
        <div className="event-page">
            <div className="event-page__map">
                { }
                <SeatMap eventId={eventId} />
            </div>
            <div className="event-page__cart">
                <Cart />
            </div>
        </div>
    );
};

export default EventPage;