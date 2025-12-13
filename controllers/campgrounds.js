const Campground = require("../models/campground");
const catchAsync = require('../utils/CatchAsync')
const {cloudinary} = require("../cloudinary")
const maptilerClient = require("@maptiler/client");


maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = catchAsync(async (req,res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

module.exports.renderNewForm = catchAsync(async(req ,res) => {
    res.render('campgrounds/new');
})

module.exports.createCampground = catchAsync(async (req,res,next) => {

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.images= req.files.map(f =>({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    console.log(campground); 
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
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    // console.log(req.body, req.files)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;

    if (req.files && req.files.length > 0) {
        let imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
        campground.images.push(...imgs);
    }
    await campground.save();
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages)
        {
            console.log('Deleting from Cloudinary:', filename);
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images:{filename:{$in:req.body.deleteImages}}}});
        console.log('Deleted images:', req.body.deleteImages);
    }
        
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);

})

module.exports.deleteCampground = catchAsync(async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})