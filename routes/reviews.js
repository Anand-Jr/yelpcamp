const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");

const reviews = require('../controllers/reviews.js')

const catchAsync = require('../utils/CatchAsync.js')
const ExpressError = require('../utils/ExpressError.js')

const { ValidateReview, isLoggedIn,isReviewAuthor }  = require("../middleware");


router.post("/", isLoggedIn, ValidateReview , reviews.creatreview);

router.delete("/:reviewid", isLoggedIn, isReviewAuthor, reviews.deleteReview);

module.exports = router;