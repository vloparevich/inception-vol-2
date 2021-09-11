const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Dealer = require('../models/Dealer.model');
const Review = require('../models/Review.model');

const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

const VehiclesApi = require('../service/VehiclesApi');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// GET route to render the form for adding review about a dealer
// ****************************************************************************************
// router.get('/review/add-review/:dealerName', isLoggedIn, (req, res) => {
router.get('/add-review/:dealerName/:vin', (req, res) => {
  console.log('Review');
  const { dealerName, vin } = req.params;
  res.render('reviews/new-review', { dealerName, vin });
});

// ****************************************************************************************
// POST route to post a revireew
// ****************************************************************************************
router.post('/add-review', isLoggedIn, async (req, res) => {
  const { dealerName, reviewContent, vin } = req.body;
  let { _id, firstName, lastName, vehicles, reviews } = req.session.user;
  const user_id = mongoose.Types.ObjectId(_id);

  const dealerInDb = await Dealer.findOne({ dealerName: dealerName });
  const createdReviewInDb = await Review.create({ reviewContent, user_id });
  if (!dealerInDb) {
    await Dealer.create({ dealerName: dealerName });
  }
  await Dealer.findByIdAndUpdate(dealerInDb._id, {
    $push: { reviews: createdReviewInDb._id },
  });
  res.redirect(`/vehicles/details/${vin}`);
});

//router.put
//router.delete

module.exports = router;
