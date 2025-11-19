
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require('../utils/CatchAsync.js')
const ExpressError = require('../utils/ExpressError.js')

module.exports.creatreview = catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created review!');
    res.redirect(`/campgrounds/${req.params.id}`)
})


module.exports.deleteReview = catchAsync(async (req,res) => {
    const {id, reviewid} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
})