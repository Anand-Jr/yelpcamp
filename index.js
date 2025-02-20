const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require("./models/campground");
const catchAsync = require('./utils/CatchAsync')
const ExpressError = require('./utils/ExpressError')
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");
const {campgroundValidateSchema} = require("./schemas.js");
const {reviewValidateSchema} = require("./schemas.js");
const Review = require("./models/review");
const campground = require('./models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp').then(() =>{
    console.log("Connection successfull !!");
}).catch( err => {
    console.log("Connection failed !!");
});

const db = mongoose.connection;

const app =express();



app.engine("ejs",ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.listen(3000, ()=>{
    console.log("Riunning on port 3000")
});

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

const ValidateReview = (req,res,next) =>{

    const {error} = reviewValidateSchema.validate(req.body);
    console.log(error);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
};

app.get("/",(req,res) => {
    res.render('home');
});

app.get("/campgrounds/new", async (req,res) => {
    res.render('campgrounds/new');
});

app.post("/campgrounds", ValidateCampground, catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    
}));

app.post("/campgrounds/:id/reviews", ValidateReview , catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${req.params.id}`)
}));

app.delete("/campgrounds/:id/reviews/:reviewid", catchAsync(async (req,res) => {
    const {id, reviewid} = req.params;
    await campground.findByIdAndUpdate(id, {$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${id}`);
}));

app.get("/campgrounds", catchAsync(async (req,res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}));

app.get("/campgrounds/:id", catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); 
    res.render('campgrounds/show',{campground});
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit',{campground});
}));

app.put("/campgrounds/:id", catchAsync(async (req, res)=> {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.all('*', (req, res, next) =>{

    next(new ExpressError("Page not found", 404));
})

app.use((err, req,res,next) => {
    const { statusCode =500, message = "Something went wrong"} = err;
    if  (!err.message){
        err.message = "Oh no somethgon went wrong!"
    }

    res.status(statusCode).render('error', {err});
    //res.send("Oh Boy, Something went wrong!")
});