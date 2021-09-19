const router = require('express').Router();
const User = require('../models/User.model');
const Dealer = require('../models/Dealer.model');

const isLoggedOut = require('../middleware/isLoggedOut');
const isLoggedIn = require('../middleware/isLoggedIn');

const VehiclesApi = require('../service/VehiclesApi');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// POST route to submit search query
// ****************************************************************************************
router.post('/', (req, res) => {
  const { make, model, year_min, year_max, city, bodyStyle } = req.body;
  console.log('our queries', {
    make,
    model,
    year_min,
    year_max,
    city,
    bodyStyle,
  });

  vehiclesApi
    .getQueriedListings(make, model, year_min, year_max, city, bodyStyle)
    .then((queriedVehicles) => {
      const { records } = queriedVehicles.data;
      const suvCars = records.filter((car) => car.bodyStyle === 'suv');
      res.render('vehicles/vehicles-list', {
        vehiclesFromApi: records,
        suvCars: suvCars,
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
// router.get('/:id/details', (req, res, next) => {
//   Vehicle.findById(req.params.id)
//     .populate({
//       path: 'details',
//       populate: { path: 'user' },
//     })
//     .then((vehicleFromAPI) => {
//       console.log({ vehicle: vehicleFromAPI.make.model });
//       console.log({ vehicle: vehicleFromAPI });
//       res.render('/details', {
//         vehicleFromAPI,
//         isAuth: req.session?.user._id,
//       });
//     });
// });

// ****************************************************************************************
// GET route to get the details of selected vehicle and render details page
// ****************************************************************************************
router.get('/details/:vin/:isSaved?', isLoggedIn, (req, res, next) => {
  let { _id } = req.session.user;
  const errorDeletion = req.session?.errorDeletion;
  const { vin, isSaved } = req.params;
  console.log('SAVED', isSaved);
  vehiclesApi.getVehicleDetails(vin).then((vehicleFromAPI) => {
    const dealerName = vehicleFromAPI.data.dealerName;
    Dealer.find({ dealerName: dealerName })
      .populate({
        path: 'reviews',
        populate: {
          path: 'user_id',
        },
      })
      .then((foundDealerFromDB) => {
        const foundDealer = JSON.parse(JSON.stringify(foundDealerFromDB));
        res.render('vehicles/vehicle-details', {
          currentActiveUserId: _id,
          vehicle: vehicleFromAPI.data,
          foundDealer: foundDealer,
          dealerName: dealerName,
          isSaved: isSaved,
          errorDeletion: errorDeletion,
        });
      });
    delete req.session.errorDeletion;
  });
});

module.exports = router;
