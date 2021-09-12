const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewContent: { type: String, maxlength: 200 },
});

const Review = model('Review', reviewSchema);
module.exports = Review;
