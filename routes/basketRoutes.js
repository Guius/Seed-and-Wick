const express = require('express');

const basketController = require('./../controller/basketController');
const authController = require('./../controller/authController');
const Basket = require('../models/basketModel');

const router = express.Router({ mergeParams: true });

// router.route('/').get(basketController.getBasket);
router.use(authController.protect);

router
  .route('/getBasketCandles')
  .get(
    authController.restrictTo('admin', 'dev'),
    basketController.getBasketsWithCandle
  );

router
  .route('/')
  .get(basketController.getUserBasket)
  .delete(basketController.emptyUserBasket)
  .post(basketController.addToBasket);

router
  .route('/:candleID')
  .delete(basketController.removeFromBasket);

module.exports = router;
