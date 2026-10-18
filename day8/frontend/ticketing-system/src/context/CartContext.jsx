import { useState } from 'react';
import api from '../services/api';
import { CartContext } from './cart-context';

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = async (seat) => {
        setCartItems(prev => [...prev, seat]);

        try {
            await api.post('/reserve', { seatIds: [seat.id] });
        } catch (err) {
            console.error('Failed to reserve seat:', err);
            setCartItems(prev => prev.filter(s => s.id !== seat.id));
            alert('Sorry, this seat was just taken by someone else!');
        }
    };

    const removeFromCart = async (seatId) => {
        setCartItems(prev => prev.filter(s => s.id !== seatId));

        try {
            await api.delete(`/release/${seatId}`);
        } catch (err) {
            console.error('Failed to release seat:', err);
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}
