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
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// GET route to show profile page
// ****************************************************************************************

router.get('/', isLoggedIn, (req, res) => {
  const user = req.session.user;
  res.render('user/profile', {
    userObject: user,
    isLoggedIn: req.session.user,
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
router.post('/profile/delete', (req, res, next) => {
  const user_id = mongoose.Types.ObjectId(user._id);

  User.findByIdAndDelete(user_id)
    .then(() => res.redirect('/', { _id: user_id }))
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
          });
        });
    });
});

router.post('/savedvehicles', (req, res) => {
  const user_id = req.session.user._id;
  const { vin } = req.body;

  User.findByIdAndUpdate(user_id, {
    $push: {
      savedVehicles: vin,
    },
    new: true,
  }).then((updatedSave) => {
    res.redirect(`/vehicles/details/${vin}/${true}`);
  });
});

module.exports = router;
