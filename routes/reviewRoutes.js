const express = require('express');

const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.restrictTo('user', 'dev'),
    reviewController.setCandleIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(
    authController.restrictTo('user', 'dev'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'dev'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);

module.exports = router;
