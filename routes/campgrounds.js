const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
// /const Campground = require("../models/campground");
const catchAsync = require('../utils/CatchAsync')
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
//
const { isLoggedIn, isAuthor, ValidateCampground }  = require("../middleware");


router.get("/",campgrounds.index);

router.get("/new", isLoggedIn,campgrounds.renderNewForm);

router.post("/", isLoggedIn, upload.array('campground[image]'), ValidateCampground, campgrounds.createCampground);

router.get("/:id", campgrounds.showCampground);

router.get("/:id/edit", isLoggedIn, isAuthor,campgrounds.renderEditForm);

router.put("/:id", isLoggedIn, isAuthor, upload.array('image'), ValidateCampground, campgrounds.updateCampground );

router.delete('/:id', isLoggedIn, isAuthor, campgrounds.deleteCampground);


module.exports = router;