// const { Router } = require('express');
// const router = new Router();
const router = require('express').Router();
const mongoose = require('mongoose');

// Require the User model in order to interact with the database
const User = require('../models/User.model');
const Vehicle = require('../models/Vehicle.model');

const fileUploader = require('../config/cloudinary.config');

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

const VehiclesApi = require('../service/VehiclesApi');
const Review = require('../models/Review.model');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// GET route to show profile page
// ****************************************************************************************

router.get('/', isLoggedIn, (req, res) => {
  const user = req.session.user;
  const user_id = mongoose.Types.ObjectId(user._id);
  User.findById(user_id).then((foundUser) => {
    res.render('user/profile', {
      userObject: foundUser,
      isLoggedIn: user,
    });
  });
});

// ****************************************************************************************
// GET route to show edit profile page
// ****************************************************************************************

router.get('/edit', isLoggedIn, (req, res) => {
  const user = req.session.user;
  const user_id = mongoose.Types.ObjectId(user._id);
  res.render('user/edit', {
    user: user,
    _id: user_id,
    isLoggedIn: req.session.user,
  });
});

// ****************************************************************************************
// POST route to edit profile page
// ****************************************************************************************
router.post(
  '/',
  isLoggedIn,
  fileUploader.single('profilePic'),
  (req, res, next) => {
    const user = req.session.user;
    const user_id = mongoose.Types.ObjectId(user._id);
    const {
      firstName,
      lastName,
      email,
      location,
      currentVehicle,
      existingImage,
    } = req.body;

    let profilePic;
    if (req.file) {
      profilePic = req.file.path;
    } else {
      profilePic = existingImage;
    }

    User.findByIdAndUpdate(
      user_id,
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        location: location,
        currentVehicle: currentVehicle,
        profilePic,
      },
      {
        new: true,
      }
    )
      .then((updatedProfile) => {
        res.render('user/profile', {
          userObject: updatedProfile,
          _id: user_id,
          isLoggedIn: req.session.user,
        });
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).render('auth/signup', {
            errorMessage: error.message,
          });
        }
      });
  }
);

// ****************************************************************************************
// POST route to delete user from database
// ****************************************************************************************
router.post('/delete/:user_id', isLoggedIn, (req, res, next) => {
  const { user_id } = req.params;
  const objUserId = mongoose.Types.ObjectId(user_id);
  Review.deleteMany({ user_id: objUserId })
    .then((removedReviews) => {
      console.log({ removedReviews: removedReviews });
    })
    .catch((err) => {
      console.log('Something went wrong during removing the reviews', err);
      res.render('error');
    });
  User.findByIdAndDelete(user_id)
    .then((removedAccount) => {
      console.log({ removedAccount: removedAccount });
      res.redirect('/auth/logout');
    })
    .catch((error) => next(error));
});

// ****************************************************************************************
// GET route to show saved vehicles
// ****************************************************************************************
router.get('/savedvehicles', isLoggedIn, (req, res) => {
  const user = req.session.user;
  const user_id = req.session.user._id;
  User.findById(user_id)
    .populate({
      path: 'vehicles',
    })
    .then((foundUserWithVehicles) => {
      vehiclesApi
        .getVehiclesList(foundUserWithVehicles.savedVehicles)
        .then((list) => {
          const normalizedList = list.map((current) => {
            return current.data;
          });
          res.render('vehicles/vehicles-list', {
            vehiclesFromApi: normalizedList,
            savedVehiclesPage: true,
            usersListOfVehicles: true,
          });
        });
    });
});

// ****************************************************************************************
// POST route to add saved vehicles
// ****************************************************************************************
router.post('/savedvehicles', (req, res) => {
  const user_id = req.session.user._id;
  const { vin, dealerLink } = req.body;
  User.findByIdAndUpdate(
    user_id,
    {
      $push: {
        savedVehicles: { vin: vin, url: dealerLink },
      },
    },
    { new: true }
  ).then(() => {
    res.redirect(307, `/vehicles/details/${vin}/${true}`);
  });
});

// ****************************************************************************************
// GET route to delete a saved vehicle
// ****************************************************************************************
router.get('/savedvehicles/delete/:vin', (req, res) => {
  const user_id = req.session.user._id;
  const { vin } = req.params;
  User.findByIdAndUpdate(
    user_id,
    {
      $pull: {
        savedVehicles: { vin: vin },
      },
    },
    { new: true }
  ).then((updatedSave) => {
    console.log('deleted', updatedSave);
    res.redirect('/profile/savedvehicles');
  });
});

module.exports = router;
