//Express configuration used in app.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug'); //template engine used with Express. others that could be used as well. It does not need to be installed nor does it need to be required
app.set('views', path.join(__dirname, 'views'));

// 1 GLOBAL MIDDLEWARES
// to get to the files that are locally stored - serving static files
app.use(express.static(path.join(__dirname, 'public')));
// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
	
	app.use(morgan('dev')); // dev gives different details of what is called. you can use different formats/options and it will return different things (github Morgan for details)
}
// limit requests for same API
const limiter = rateLimit({
	max      : 100,
	windowMs : 60 * 60 * 1000, //100 requests in 1 hour
	message  : 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// body  parser- reading date from the body into req.body
app.use(express.json({ limit: '10kb' })); //middle ware. in between request and response - data is added to json
/* app.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello from the server side!', app: 'Natours' });
}); */

app.use(express.urlencoded({extended: true, limit: '10kb'})) // for non-API user data savings
app.use(cookieParser());  //parses the data from the cookie


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
	hpp({
		whitelist : [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price'
		]
	})
);

// test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
//	console.log(req.cookies)

	next();
});

// 3 ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
