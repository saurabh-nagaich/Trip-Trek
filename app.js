const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController")
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoute');

const app = express();
// app.use(cors())

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Globalmedialwares
// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// Set Security HTTP headers
app.use(helmet())
// app.use(helmet({ contentSecurityPolicy: false }))
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src  'self' https://js.stripe.com/v3/ https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com blob: connect.facebook.net maps.googleapis.com cdnjs.cloudflare.com cdn.quilljs.com *.aws",
    "script-src-elem 'self' connect.facebook.net maps.googleapis.com cdnjs.cloudflare.com cdn.quilljs.com *.aws",
    "style-src 'self' cdnjs.cloudflare.com; localhost:8000;",
    "img-src 'self'"
  );
  next();
});



// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again in an hour!'
})
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser());

// Data sanitization against NoSql query injecton
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
// sort=duration&sort=price
app.use(hpp({
  whitelist: ['duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))


app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
})


// 2) ROUTE HANDLERS
// app.get('/api/v1/tours',getAllTours)
// app.post('/api/v1/tours',createTour)
// app.get('/api/v1/tours/:id',getTour)
// app.patch('/api/v1/tours/:id',updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)

// 3) ROUTES

// app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler)

module.exports = app;
