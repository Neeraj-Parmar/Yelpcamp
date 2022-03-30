const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/index'); // node automatically requires index file
const upload = multer({ storage });

const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, validateCampground, isOwner } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.detail))
	.put(isLoggedIn, isOwner, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
	.delete(isLoggedIn, isOwner, catchAsync(campgrounds.destroy));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campgrounds.renderEditForm));

module.exports = router;
