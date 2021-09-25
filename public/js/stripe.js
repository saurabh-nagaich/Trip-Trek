import axios from 'axios'
import { showAlert } from './alerts';
var stripe = Stripe("pk_test_51JVaHSSHqHrYM0qkqcZiUGjs64lOYFFfWeQk0yvLocvUmiXxUC46fL0HZ46sC0W7pJoPElt0O8kdvYwJYhcziuqh00A57piPPF");

export const bookTour = async tourId =>{
    try{
        // 1) get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)

        // 2) Create checkout from + charge credit card
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        });

    }catch(err){
        
        showAlert('error',err)
    }
}