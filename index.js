if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

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
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo').default;

const campgrounds= require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');
const { isLoggedIn } = require('./middleware');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const db_url = process.env.DB_URL 
// const db_url="mongodb://127.0.0.1:27017/yelpcamp";


mongoose.connect(db_url).then(() =>{
    console.log("Connection successfull !!");
}).catch( err => {
    console.log("Connection failed !!");
});

const db = mongoose.connection;
const app =express();

app.listen(3000, ()=>{
    console.log("Running on port 3000")
});


app.engine("ejs",ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

const connectSrcUrls = [
    "https://api.maptiler.com/",
];

const imgSrcUrls = [
    "https://images.unsplash.com/",
    "https://res.cloudinary.com/",
    "https://api.maptiler.com/",
    "https://picsum.photos",
    "https://*.picsum.photos"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
            fontSrc: ["'self'", ...styleSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

const sessionConfig = {
    store,
    name: "sessionconf", 
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');      
    res.locals.error = req.flash('error');
    next();
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'fake@example.com', username: 'fakeUser'});
    const registeredUser = await User.register(user, 'password');
    res.send(registeredUser);
});


app.use('/', users);
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

