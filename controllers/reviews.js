const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.create = async (req, res) => {
	const camp = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	camp.reviews.push(review);
	await review.save();
	await camp.save();
	req.flash('success', 'Review added!');
	res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.delete = async (req, res) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Review deleted!');
	res.redirect(`/campgrounds/${id}`);
}