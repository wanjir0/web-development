import { useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/useCart';

const Cart = () => {
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const { cartItems, removeFromCart, clearCart } = useCart();

    const totalPrice = cartItems.length * 50;

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setIsCheckingOut(true);
        try {
            const seatIds = cartItems.map(item => item.id);
            const res = await api.post('/checkout', { seatIds });

            alert(`🎉 Success! Order #${res.data.orderId} confirmed.`);

            clearCart();
        } catch {
            alert('Checkout failed. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="cart">
            <h2 className="cart__title">🛒 Your Cart</h2>

            {cartItems.length === 0 ? (
                <p className="cart__empty">No seats selected yet.<br />Click a green seat to begin!</p>
            ) : (
                <>
                    <ul className="cart__items">
                        {cartItems.map((item) => (
                            <li key={item.id} className="cart__item">
                                <div className="cart__item-info">
                                    <span className="cart__item-seat">
                                        Row {item.row_label}, Seat {item.seat_number}
                                    </span>
                                    <span className="cart__item-price">$50.00</span>
                                </div>
                                <button
                                    className="cart__remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="cart__total">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                        className="cart__checkout-btn"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? 'Processing...' : `Checkout (${cartItems.length} ${cartItems.length === 1 ? 'ticket' : 'tickets'})`}
                    </button>
                </>
            )}
        </div>
    );
};

export default Cart;