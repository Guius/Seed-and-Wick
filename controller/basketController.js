const AppError = require('../utils/appError');
const Product = require('./../models/productModel');
const User = require('./../models/userModel');
const Basket = require('./../models/basketModel');

const catchAsync = require('./../utils/catchAsync');

exports.createUserFriendlyBasket = async (req) => {
  const userBasket = await Basket.find({
    user: req.user._id,
  }).populate({ path: 'candle', select: 'name' });

  // Create a user friendly response with only an a array of objects, each object containing just the name of candle and the scent
  let userFriendlyBasket = [];
  let candleArray = [];
  userBasket.forEach((el) => {
    const obj = {
      candle: el.candle.name,
      scent: el.scent,
      id: el._id,
    };
    candleArray.push(JSON.stringify(el._id));
    userFriendlyBasket.push(obj);
  });
  const objToReturn = {
    userBasket,
    userFriendlyBasket,
    candleArray,
  };
  return objToReturn;
};

exports.getBasket = (req, res) => {
  res.status(200).json({
    status: 'success',
    message:
      'This route is to get all the items in people ',
  });
};

exports.getUserBasket = catchAsync(async (req, res) => {
  const basket = await this.createUserFriendlyBasket(req);

  res.status(200).json({
    status: 'success',
    data: {
      results: basket.userFriendlyBasket.length,
      basket: basket.userFriendlyBasket,
    },
  });
});

exports.emptyUserBasket = catchAsync(
  async (req, res, next) => {
    await Basket.deleteMany({ user: req.user._id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

exports.addToBasket = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.candle)
    req.body.candle = req.params.candleId;

  // 1) Check that the candle that the user is adding is a real candle
  const product = await Product.findById(req.body.candle);

  if (!product) {
    return next(
      new AppError(
        'The item you are trying to add to your basket does not exist. The candle may have been dicontinued recently by our administators',
        400
      )
    );
  }

  // 2) Check that the candle is still in stock
  if (product.stock < 1) {
    return next(
      new AppError(
        'The item you are trying to add to your basket is temporarily out of stock. Please try again soon',
        400
      )
    );
  }

  // 3) Make query to the database to return all elements which match exactly the user's request (user id, candle, scent)
  const basket = await Basket.find({
    candle: req.body.candle,
    scent: req.body.scent,
    user: req.user._id,
  });

  // 4) The query returns an empty array --> the user does not have this item in his basket --> add it to the basket
  if (!basket[0]) {
    await Basket.create({
      candle: req.body.candle,
      scent: req.body.scent,
      user: req.user._id,
    });
  }

  // 5) Create a user friendly response with only an a array of objects, each object containing just the name of candle and the scent
  const newBasket = await this.createUserFriendlyBasket(
    req
  );

  // 6) Send back response with the user friendly basket and add the basket to the user object
  res.status(200).json({
    status: 'success',
    message: 'This is your basket',
    data: {
      results: newBasket.userBasket.length,
      basket: newBasket.userFriendlyBasket,
    },
  });
});

exports.removeFromBasket = catchAsync(
  async (req, res, next) => {
    // 1) Get id of basket element from req.params
    const candleId = req.params.candleID;

    // 2) Create a new userFriendlyBasket with the updated data and create an array of all the candle ids
    const newBasket = await this.createUserFriendlyBasket(
      req
    );

    // 2) Check that that basket element is owned by the current user
    const convertedString = `"${candleId}"`;
    if (!newBasket.candleArray.includes(convertedString)) {
      return next(
        new AppError(
          'The item requested to be removed is not in this users basket. Please try with another element that is in the users candle',
          400
        )
      );
    }

    // 3) Delete the item from the database
    await Basket.findByIdAndDelete(candleId);

    // 4) Get the new basket
    const newerBasket = await this.createUserFriendlyBasket(
      req
    );

    // 5) Return the new userFriendly Basket basket
    res.status(200).json({
      status: 'success',
      data: {
        results: newerBasket.userBasket.length,
        data: {
          basket: newerBasket.userFriendlyBasket,
        },
      },
    });
  }
);

exports.getBasketsWithCandle = catchAsync(
  async (req, res, next) => {
    // 1) Perform the query
    const baskets = await Basket.find({
      candle: req.body.candle,
      scent: req.body.scent,
    });

    // 2) Send back response
    res.status(200).json({
      status: 'success',
      data: {
        results: baskets.length,
      },
    });
  }
);
