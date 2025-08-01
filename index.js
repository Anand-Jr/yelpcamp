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


const campgrounds= require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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
    console.log("Running on port 3000")
});




app.use('/campgrounds', campgrounds);

app.use('/campgrounds/:id/reviews', reviews);

app.get("/",(req,res) => {
    res.render('home');
});


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