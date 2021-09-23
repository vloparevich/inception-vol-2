const express = require('express');
const app = express();
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
router.get('/add-review/:dealerName/:vin', isLoggedIn, (req, res) => {
  const { dealerName, vin } = req.params;
  res.render('reviews/new-review', {
    dealerName,
    vin,
  });
});

// ****************************************************************************************
// POST route to post a revireew
// ****************************************************************************************
router.post('/add-review', isLoggedIn, async (req, res) => {
  const { dealerName, reviewContent, vin } = req.body;
  let { _id, firstName, lastName, vehicles, reviews } = req.session.user;
  const user_id = mongoose.Types.ObjectId(_id);
  try {
    const dealerInDb = await Dealer.findOne({ dealerName: dealerName });
    const createdReviewInDb = await Review.create({
      reviewContent,
      //find and remove this object
      user_id,
      vin,
    });
    if (!dealerInDb) {
      await Dealer.create({ dealerName: dealerName });
    }
    await Dealer.findByIdAndUpdate(dealerInDb._id, {
      $push: { reviews: createdReviewInDb._id },
    });
    res.redirect(307, `/vehicles/details/${vin}`);
  } catch (err) {
    console.log('Soemthing went wrong during postin the review:', err);
  }
});

// ****************************************************************************************
// GET route to delete a review if belongs to this user
// ****************************************************************************************
router.post('/delete/:reviewId/:vin', isLoggedIn, async (req, res) => {
  let reviewFromDB;
  let reviewCreatorIdFromDB;
  const { _id } = req.session.user;
  const { reviewId, vin } = req.params;
  const { dealerLink } = req.body;
  req.session.dealerLinkFromGlobalScope = dealerLink;

  try {
    reviewFromDB = await Review.findById(reviewId);
    reviewCreatorIdFromDB = reviewFromDB.user_id.toString();
    if (_id === reviewCreatorIdFromDB) {
      await Review.findByIdAndRemove(reviewId);
    } else {
      req.session.errorDeletion =
        'You are not Authorized to Delete this review, you are not a creator of it....';
    }
  } catch (err) {
    console.log('Soemthing went wrong during deletion of the review:', err);
  }
  console.log('REDIRECTING DELETE');
  res.redirect(307, `/vehicles/details/${vin}`);
});

// ****************************************************************************************
// GET route to render the review for editing
// ****************************************************************************************
router.post('/edit/:reviewId/:dealerName/:vin', (req, res) => {
  const { reviewId, dealerName, vin } = req.params;
  const { dealerLink } = req.body;
  Review.findById(reviewId)
    .populate('user_id')
    .then((foundReview) => {
      console.log('My review:', foundReview);
      res.render('reviews/update-review-form', {
        foundReview: foundReview,
        dealerName: dealerName,
        reviewId: reviewId,
        vin: vin,
        dealerLink: dealerLink,
      });
    });
});

// ****************************************************************************************
// POST route to update the review
// ****************************************************************************************
router.post('/edit/:reviewId/:vin', async (req, res) => {
  const { reviewId, vin } = req.params;
  const { reviewContent, dealerLink } = req.body;
  // app.locals.dealerLinkFromGlobalScope = dealerLink;
  // console.log({
  //   dealerLinkFromGlobalScope: app.locals.dealerLinkFromGlobalScope,
  // });
  req.session.dealerLinkFromGlobalScope = dealerLink;
  console.log({
    dealerLinkFromGlobalScope: req.session.dealerLinkFromGlobalScope,
  });
  const { _id } = req.session.user;
  let reviewFromDB;
  let reviewCreatorIdFromDB;

  try {
    reviewFromDB = await Review.findById(reviewId);
    reviewCreatorIdFromDB = reviewFromDB.user_id.toString();
    if (_id === reviewCreatorIdFromDB) {
      await Review.findByIdAndUpdate(
        reviewId,
        { reviewContent: reviewContent },
        { new: true }
      );
    } else {
      req.session.errorDeletion =
        'You are not Authorized to EDIT this review, you are not a creator of it....';
    }
  } catch (err) {
    console.log('Soemthing went wrong during editing the review:', err);
  }
  console.log('REDIRECTING EDIT');
  res.redirect(307, `/vehicles/details/${vin}`);
});

module.exports = router;
