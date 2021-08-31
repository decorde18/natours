/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51JRSJEJQR0Eec9WQjVgaIWVO3HhPLDHZgULcswXiLj5BOCsLEeUy9ANhlBVw1YcyFDOwDe8wK7rMNNvPae4tRIA000LbEeBflv');

export const bookTour = async tourId => {
    try {
        
        //1. get the session from the server 
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session)
        //2. Create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
        
    } catch(err) {
        console.log(err);
        showAlert('error', err)
    }

};