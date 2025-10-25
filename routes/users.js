const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})


router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // Passport-local-mongoose method
        req.login(registeredUser, err => { // Passport method to log in the user
            if (err) return next(err);          
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');           
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
});


router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);

    delete req.session.returnTo;
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 

module.exports = router;