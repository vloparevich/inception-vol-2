const { Router } = require('express');
const router = new Router();
const nodemailer = require('nodemailer');
const templates = require('../templates/template');

// ℹ️ Handles password encryption
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require('../models/User.model');

const fileUploader = require('../config/cloudinary.config');

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

// ****************************************************************************************
// GET route to render signup form
// ****************************************************************************************
router.get('/signup', isLoggedOut, (req, res) => {
  res.render('auth/signup', { isLoggedIn: req.session.user });
});

router.post('/signup', fileUploader.single('profilePic'), (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log('User: ', { email, password, firstName, lastName });

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).render('auth/signup', {
      errorMessage: 'Please fill out all required fields.',
    });
  }

  // Search the database for a user with the email submitted in the form
  User.findOne({ email: email }).then((found) => {
    console.log({ found });
    //   // If the user is found, send the message email is already used
    if (found) {
      return res.status(400).render('auth/signup', {
        errorMessage: 'Email is already being used.',
      });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          email: email,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          profilePic: req.file.path,
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user;
        console.log('Session', req.session.user);
        let { email, subject, message } = req.body;
        console.log('EMAIL', { email, subject, message });

        let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.NODEMAILER_ACC,
            pass: process.env.NODEMAILER_PASS,
          },
        });

        transporter
          .sendMail({
            from: `CarAmerican <${process.env.NODEMAILER_ACC}>`,
            to: email,
            subject: 'Congrats, you are registered on CarAmerican.com',
            text: 'CarAmerican',
            html: templates.templateExample(`${firstName} ${lastName}`),
          })
          .then((info) => {
            console.log('Info from nodeamailer', info);
            res.redirect('/');
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render('auth/signup', { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render('auth/signup', {
            errorMessage: error,
          });
        }
        return res
          .status(500)
          .render('auth/signup', { errorMessage: error.message });
      });
  });
});

// ****************************************************************************************
// GET route to render login form
// ****************************************************************************************
router.get('/login', isLoggedOut, (req, res) => {
  res.render('auth/login', { isLoggedIn: req.session.user });
});

// ****************************************************************************************
// POST route to submit user's username and password
// ****************************************************************************************
router.post('/login', isLoggedOut, (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res
      .status(400)
      .render('auth/login', { errorMessage: 'Please provide your email.' });
  }

  //   // Here we use the same logic as above
  //   // - either length based parameters or we check the strength of a password
  //   if (password.length < 8) {
  //     return res.status(400).render("auth/login", {
  //       errorMessage: "Your password needs to be at least 8 characters long.",
  //     });
  //   }

  //   // Search the database for a user with the username submitted in the form
  User.findOne({ email })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res
          .status(400)
          .render('auth/login', { errorMessage: 'Wrong credentials.' });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res
            .status(400)
            .render('auth/login', { errorMessage: 'Wrong credentials.' });
        }
        req.session.user = user;
        global.test = user;
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        return res.redirect('/');
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

// ****************************************************************************************
// GET route to kill the user's session - logout
// ****************************************************************************************
router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('auth/logout', {
        errorMessage: err.message,
        isLoggedIn: req.session.user,
      });
    }
    res.redirect('/');
  });
});

module.exports = router;
