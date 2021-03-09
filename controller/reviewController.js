const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

const factory = require('./handlerFactory');

exports.setCandleIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.candle)
    req.body.candle = req.params.candleId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
