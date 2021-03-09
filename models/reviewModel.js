const mongoose = require('mongoose');

const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [
        true,
        'you must provide some text for your review',
      ],
      max: [
        1000,
        'A review must be less than 1000 characters',
      ],
    },
    rating: {
      type: Number,
      required: [true, 'Your review must have a rating'],
      max: [5, 'A rating must be greater than 5'],
      min: [0, 'A rating must be greater than 0'],
      enum: [1, 2, 3, 4, 5],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    candle: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index(
  { candle: 1, user: 1 },
  { unique: true }
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'candle',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  candleId
) {
  console.log(candleId);
  const stats = await this.aggregate([
    {
      $match: { candle: candleId },
    },
    {
      $group: {
        _id: '$candle',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(candleId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(candleId, {
      ratingsQuantity: 0,
      ratingsAverage: null,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.candle);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(
    this.r.candle
  );
});

const Review = mongoose.model('Reviews', reviewSchema);

module.exports = Review;
