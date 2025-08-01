const express = require('express');
const router = express.Router();

const Campground = require("../models/campground");
const catchAsync = require('../utils/CatchAsync')
const ExpressError = require('../utils/ExpressError')
const {campgroundValidateSchema} = require("../schemas.js");

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

router.get("/new", async (req,res) => {
    res.render('campgrounds/new');
});

router.post("/", ValidateCampground, catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    
}));


router.get("/", catchAsync(async (req,res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}));

router.get("/:id", catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); 
    res.render('campgrounds/show',{campground});
}));

router.get("/:id/edit", catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit',{campground});
}));

router.put("/:id", catchAsync(async (req, res)=> {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));


module.exports = router;