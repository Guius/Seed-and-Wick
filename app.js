const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const basketRouter = require('./routes/basketRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const { dir } = require('console');

const app = express();

// 1) MIDDLEWARES

// Security HTTP headers
app.use(helmet());

// body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitisation against NoSQL query injection
app.use(mongoSanitize());

// Data santisation again XSS attacks
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'number of sales',
      'deliveryCost',
      'stock',
    ],
  })
);

// 3) ROUTES
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/basket', basketRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this Server!`,
      404
    )
  );
});

app.use(globalErrorHandler);

module.exports = app;
