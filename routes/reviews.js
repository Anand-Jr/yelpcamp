const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground");
const Review = require("../models/review");

const {reviewValidateSchema} = require("../schemas.js");

const catchAsync = require('../utils/CatchAsync.js')
const ExpressError = require('../utils/ExpressError.js')



const ValidateReview = (req,res,next) =>{

    const {error} = reviewValidateSchema.validate(req.body);
    //console.log(error);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
};

router.post("/", ValidateReview , catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${req.params.id}`)
}));

router.delete("/:reviewid", catchAsync(async (req,res) => {
    const {id, reviewid} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;