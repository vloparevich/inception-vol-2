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
      console.log(records[0]);
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

// ****************************************************************************************
// GET route to get the details of selected vehicle and render details page
// ****************************************************************************************
// to be reviewed....
router.get('/:id/details', (req, res, next) => {
  Vehicle.findById(req.params.id)
    .populate({
      path: 'details',
      populate: { path: 'user' },
    })
    .then((vehicleFromAPI) => {
      console.log({ vehicle: vehicleFromAPI.make.model });
      res.render('/details', {
        vehicleFromAPI,
        isAuth: req.session?.user._id,
      });
    });
});

// ****************************************************************************************
// GET route to get the details of selected vehicle and render details page
// ****************************************************************************************
//!!!!!! uncomment when login is ready--> router.get('/vehicle/details/:vin', isLoggedIn, (req, res, next) => {
router.get('/details/:vin', (req, res, next) => {
  const { vin } = req.params;
  vehiclesApi.getVehicleDetails(vin).then((vehicleFromAPI) => {
    console.log(vehicleFromAPI);
    res.render('vehicles/vehicle-details', { vehicle: vehicleFromAPI.data });
  });
});

module.exports = router;
