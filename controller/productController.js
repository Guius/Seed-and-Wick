const Product = require('./../models/productModel');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopCandles = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,description,stock,dispatch,deliveryCost';
  next();
};

exports.aliasTopCandle = (req, res, next) => {
  req.query.limit = '1';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverage,description,stock,dispatch,deliveryCost';
  next();
};

exports.getAllCandles = factory.getAll(Product, true);
exports.createCandle = factory.createOne(Product);
exports.updateCandle = factory.updateOne(Product);
exports.deleteCandle = factory.deleteOne(Product);

exports.getCandle = factory.getOne(Product, {
  path: 'reviews',
});

exports.getCandleStats = catchAsync(
  async (req, res, next) => {
    const stats = await Product.aggregate([
      {
        $match: { stock: { $gte: 0 } },
      },
      {
        $group: {
          _id: '$price',
          numProducts: { $sum: 1 },
          numOrders: { $sum: '$numberOfSales' },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  }
);
