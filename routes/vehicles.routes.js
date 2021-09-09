const router = require('express').Router();
const User = require('../models/User.model');

const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

const VehiclesApi = require('../service/VehiclesApi');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// POST route to submit search query
// ****************************************************************************************
router.post('/', (req, res) => {
  const { make, model, year_min, year_max, city } = req.body;
  console.log('our queries', { make, model, year_min, year_max, city });

  vehiclesApi
    .getQueriedListings(make, model, year_min, year_max, city)
    .then((queriedVehicles) => {
      const { records } = queriedVehicles.data;
      console.log('SEARCHED: ', { records });

      res.render('vehicles/vehicles-list', {
        vehiclesFromApi: records,
      });
    })
    .catch((err) => {
      console.log('Error appaeared during getting cars from API', err);
      res.render('vehicles/vehicles-list', {
        errorMessage:
          'Oops, something went wrong,\ntry one more time, please 😔',
      });
    });
});

module.exports = router;
