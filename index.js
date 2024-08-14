const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require("./models/campground");
const campground = require('./models/campground');
const methodOverride = require("method-override");

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp').then(() =>{
    console.log("Connection successfull !!");
}).catch( err => {
    console.log("Connection failed !!");
});

const db = mongoose.connection;

const app =express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.listen(3000, ()=>{
    console.log("Riunning on port 3000")
});

app.get("/",(req,res) => {
    res.render('home');
});

app.get("/campgrounds/new", async (req,res) => {
    res.render('campgrounds/new');
});

app.post("/campgrounds", async (req,res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get("/campgrounds", async (req,res) => {
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
});

app.get("/campgrounds/:id", async (req,res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/show',{campground});
});

app.get("/campgrounds/:id/edit", async (req,res) => {
    const campground = await Campground.findById(req.params.id); 
    res.render('campgrounds/edit',{campground});
});

app.put("/campgrounds/:id", async (req, res)=> {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
});