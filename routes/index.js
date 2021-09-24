const router = require('express').Router();
const Dealer = require('../models/Dealer.model');

const VehiclesApi = require('../service/VehiclesApi');
const vehiclesApi = new VehiclesApi();

// ****************************************************************************************
// GET route to get the default set of 20 vehicles and render index/landing page
// ****************************************************************************************
router.get('/', async (req, res) => {
  try {
    const vehiclesFromApi = await vehiclesApi.getGeneralLisiting();
    let records = vehiclesFromApi.data.records;
    console.log('MY CURRENT RECORDS', records);
    const trimmedArrOfCars = records.filter((curr, i) => i < 5 && curr);
    const trimmedArrOfCarsAndRevLength = trimmedArrOfCars.map(
      async (current) => {
        const dealerName = current.dealerName;

        const dealer = await Dealer.findOne({ dealerName: dealerName });
        current.reviewLength = dealer.reviews.length;
        return {
          ...current,
          reviewLength: dealer.reviews.length,
        };
      }
    );

    let data = await Promise.all(trimmedArrOfCarsAndRevLength);

    res.render('index', {
      vehiclesFromApi: data,
      isLoggedIn: req.session.user,
    });
  } catch (err) {
    console.log('Error appaeared during getting cars from API', err);
    res.render('index', {
      errorMessage: 'Oops, something went wrong,\ntry one more time, please 😔',
    });
  }
});

module.exports = router;
