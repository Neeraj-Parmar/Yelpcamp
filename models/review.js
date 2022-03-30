const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = new mongoose.model('Review', reviewSchema);