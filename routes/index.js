const router = require('express').Router();
const User = require('../models/User.model');

const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

const VehiclesApi = require('../service/VehiclesApi');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// GET route to get the default set of 20 vehicles and render index/landing page
// ****************************************************************************************
router.get('/', (req, res) => {
  console.log('indexiiiiing');
  vehiclesApi
    .getGeneralLisiting()
    .then((vehiclesFromApi) => {
      const { records } = vehiclesFromApi.data;
      console.log({ records });
      res.render('index', {
        vehiclesFromApi: records,
      });
    })
    .catch((err) => {
      console.log('Error appaeared during getting cars from API', err);
      res.render('index', {
        errorMessage:
          'Oops, something went wrong,\ntry one more time, please 😔',
      });
    });
});

module.exports = router;
