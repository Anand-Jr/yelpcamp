const ExpressError = require('./utils/ExpressError')
const {campgroundValidateSchema, reviewValidateSchema} = require("./schemas.js");
const Campground = require("./models/campground");
const Review = require("./models/review");

const ValidateCampground = (req,res,next) =>{

    const {error} = campgroundValidateSchema.validate(req.body);
    console.log(error);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (campground.author.equals(req.user._id) === false) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/campgrounds');
    }
    next();
}


const isReviewAuthor = async (req, res, next) => {
    const {id, reviewid } = req.params;
    const review = await Review.findById(reviewid);
    if (review.author.equals(req.user._id) === false) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
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

module.exports = { isLoggedIn, storeReturnTo, isAuthor, ValidateCampground, ValidateReview,isReviewAuthor };