const router = require('express').Router();
const Dealer = require('../models/Dealer.model');

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
      res.status(200).render('vehicles/vehicles-list', {
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
// POST route to get the details of selected vehicle and render details page
// ****************************************************************************************
router.post('/details/:vin/:isSaved?', isLoggedIn, (req, res, next) => {
  let { _id } = req.session.user;
  const { dealerLink } = req.body;
  const { vin, isSaved } = req.params;
  const errorDeletion = req.session?.errorDeletion;
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
        const preparedDelaerLink = dealerLink.startsWith(`http`)
          ? dealerLink
          : `https://${dealerLink}`;
        res.status(200).render('vehicles/vehicle-details', {
          currentActiveUserId: _id,
          vehicle: vehicleFromAPI.data,
          foundDealer: foundDealer,
          dealerName: dealerName,
          dealerLink: preparedDelaerLink,
          isSaved: isSaved,
          errorDeletion: errorDeletion,
        });
      });
    delete req.session.errorDeletion;
  });
});

// ****************************************************************************************
// HACK, POST route to get the details of selected vehicle and get the dealerUrl for single
// vehicle (pref of the API) to render vehcile details page with all the details. This route
// 98% repeats the previous one but with '*' which cannot be applied after this one ':isSaved?'
// ****************************************************************************************
// router.post('/details/:vin/:isSaved/*', isLoggedIn, (req, res, next) => {
//   let { _id } = req.session.user;
//   // Grab params that are attached on the end of the /details/:vin/:isSaved/ route
//   console.log('HEEEEEEEEEEEEERE!!!!!!');
//   const dealerLink = req.params[0];
//   const { vin, isSaved } = req.params;
//   const errorDeletion = req.session?.errorDeletion;
//   vehiclesApi.getVehicleDetails(vin).then((vehicleFromAPI) => {
//     const dealerName = vehicleFromAPI.data.dealerName;
//     Dealer.find({ dealerName: dealerName })
//       .populate({
//         path: 'reviews',
//         populate: {
//           path: 'user_id',
//         },
//       })
//       .then((foundDealerFromDB) => {
//         const foundDealer = JSON.parse(JSON.stringify(foundDealerFromDB));
//         res.render('vehicles/vehicle-details', {
//           currentActiveUserId: _id,
//           vehicle: vehicleFromAPI.data,
//           foundDealer: foundDealer,
//           dealerName: dealerName,
//           dealerLink: dealerLink,
//           isSaved: isSaved,
//           errorDeletion: errorDeletion,
//         });
//       });
//     delete req.session.errorDeletion;
//   });
// });

module.exports = router;
