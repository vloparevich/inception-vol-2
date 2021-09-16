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

// ****************************************************************************************
// GET route to show profile page
// ****************************************************************************************

router.get('/', isLoggedIn, (req, res) => {
  const user = req.session.user;
  console.log('user: ', user);
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

  // console.log('user: ', user);

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
    console.log('user id and req.body, ', user_id, req.body);

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
        console.log('update', updatedProfile);
        res.render('user/profile', {
          userObject: user,
          _id: user_id,
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
// GET route to show saved vehicles
// ****************************************************************************************
router.get('/savedvehicles', isLoggedIn, (req, res) => {
  const user = req.session.user;
  const user_id = req.session.user._id;
  User.findById(user_id)
    .populate({ path: 'vehicles' })
    .then((foundUserWithVehicles) => {
      console.log('saved list', foundUserWithVehicles);
      res.render('/savedvehicles', {
        user: user,
        _id: user_id,
        isLoggedIn: req.session.user,
      });
    });
});

module.exports = router;
