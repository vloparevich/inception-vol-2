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
  vehiclesApi
    .getGeneralLisiting()
    .then((vehiclesFromApi) => {
      let records = vehiclesFromApi.data.records;

      // vehiclesApi.getQueriedListings('', '', '', '', '', bodyStyle);
      // .then()
      // let suvCars = records.filter((car) => car.bodyStyle === 'suv');

      // const trimmedArr = [];
      // for (i = 0; i < 4; i++) {
      //   trimmedArr.push(records[i]);
      // }
      // const newArr = Array.from(records);
      // const trimmedArr = newArr.slice(1);
      // console.log('TRIMMED', trimmedArr);
      const trimmedArr = records.filter((curr, i) => i < 4 && curr);
      console.log('TRIMMED:', { trimmedArr });
      res.render('index', {
        vehiclesFromApi: trimmedArr,
        // suvCars: suvCars,
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
