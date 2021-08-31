const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1)get currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    console.log(tour)
    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        success_url :  `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount:tour.price * 100, //expected in cents
                currency: 'usd',
                quantity: 1
            }
        ]
    })
    // 3) Create session as response
    res.status(200).json({
        status:'success',
        session
    });
});
//this is only temporaty because it is unsecure (could make bookings without payment if they know the route)
exports.createBookingCheckout = catchAsync(async(req, res, next) => { //accesses the createBooking middleware and runs it 
    const {tour, user, price} = req.query;
    if(!tour && !user && !price) return next(); //initially it has these so it awaits
    await Booking.create({tour, user, price})
    res.redirect(req.originalUrl.split('?')[0]); //hides the query string by splitting at the question mark and only calling what was before the question mark of the success_Url
    // the next middleware function is run which will bypass the createBooking and go to Auth then viewController.
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);