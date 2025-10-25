const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");

const catchAsync = require('../utils/CatchAsync.js')
const ExpressError = require('../utils/ExpressError.js')

const { ValidateReview, isLoggedIn }  = require("../middleware");


router.post("/", isLoggedIn, ValidateReview , catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created review!');
    res.redirect(`/campgrounds/${req.params.id}`)
}));

router.delete("/:reviewid", isLoggedIn, isReviewAuthor, catchAsync(async (req,res) => {
    const {id, reviewid} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;