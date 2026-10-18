import EventPage from './pages/EventPage';

function App() {
    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-header__title">🎫 TicketHub</h1>
                <p className="app-header__subtitle">Your gateway to unforgettable experiences</p>
            </header>
            <main className="app-main">
                <EventPage />
            </main>
        </div>
    );
}

export default App;