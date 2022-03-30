const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
	url: String,
	filename: String
});

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema(
	{
		title: String,
		price: Number,
		description: String,
		images: [ imageSchema ],
		geometry: {
			type: {
				type: String,
				enum: [ 'Point' ],
				required: true
			},
			coordinates: {
				type: [ Number ],
				required: true
			}
		},
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review'
			}
		]
	},
	opts
);

imageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});

campgroundSchema.virtual('properties.popupText').get(function() {
	return `<strong><a href=/campgrounds/${this
		._id}>${this.title}</a></strong><p>${this.description.substring(0, 20)}...</p>`;
});

campgroundSchema.post('findOneAndDelete', async function(campground) {
	if (campground.reviews.length) {
		await Review.deleteMany({ _id: { $in: campground.reviews } });
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
