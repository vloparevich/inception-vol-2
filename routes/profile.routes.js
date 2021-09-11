// const { Router } = require('express');
// const router = new Router();
const router = require('express').Router();

// Require the User model in order to interact with the database
const User = require('../models/User.model');

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/profile', (req, res) => {
  res.render('user/profile');
});

module.exports = router;