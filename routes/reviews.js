const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utilities/catchAsync');
const { validateReview, isLoggedIn, isReviewOwner } = require('../middleware.js');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.create))

router.delete('/:reviewId', isLoggedIn, isReviewOwner, catchAsync(reviews.delete))

module.exports = router;