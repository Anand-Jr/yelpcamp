const Campground = require("../models/campground");
const catchAsync = require('../utils/CatchAsync')

module.exports.index = catchAsync(async (req,res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

module.exports.renderNewForm = async(req ,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    // console.log(campground); 
    res.redirect(`/campgrounds/${campground._id}`);
    
})

module.exports.showCampground = catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate(
        { path: 'reviews', 
         populate: { path: 'author' } 
        }).populate('author');
        
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
})

module.exports.renderEditForm = catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
})  

module.exports.updateCampground = catchAsync(async (req, res)=> {
    
    const {id} = req.params
    // const campground = await Campground.findById(id);
    // console.log(campground);
    // if (!campground) {
    //     req.flash('error', 'Cannot find that campground!');
    //     return res.redirect('/campgrounds');
    // }

    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp._id}`);

})

module.exports.deleteCampground = catchAsync(async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})