const ExpressError = require('./utilities/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in first!')
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if(error){
		const msg = error.details.map( el => el.message ).join(',')
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}

module.exports.isOwner = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to perform that task');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewOwner = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to perform that task');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if(error){
		const msg = error.details.map( el => el.message ).join(',')
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
}