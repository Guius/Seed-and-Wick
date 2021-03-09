const express = require('express');

const productController = require('./../controller/productController');
const authController = require('./../controller/authController');
const basketController = require('./../controller/basketController');

const reviewRouter = require('./../routes/reviewRoutes');
const basketRouter = require('./../routes/basketRoutes');

const { route } = require('./userRoutes');

const router = express.Router();

// router.param('id', productController.checkID);

router.use('/:candleId/reviews', reviewRouter);
router.use('/:candleId/basket', basketRouter);

router.use(authController.protect);

router
  .route('/top-5-popular')
  .get(
    productController.aliasTopCandles,
    productController.getAllCandles
  );

router
  .route('/top-candle')
  .get(
    productController.aliasTopCandle,
    productController.getAllCandles
  );

router.use(authController.restrictTo('admin', 'dev'));

router
  .route('/product-stats')
  .get(productController.getCandleStats);

router
  .route('/')
  .get(productController.getAllCandles)
  .post(productController.createCandle);

router
  .route('/:id')
  .get(productController.getCandle)
  .delete(productController.deleteCandle)
  .patch(productController.updateCandle);

module.exports = router;
