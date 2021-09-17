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
    // new Promise((resolve, reject) => resolve())
    .then((vehiclesFromApi) => {
      let records = vehiclesFromApi.data.records;
      console.log({ vehiclesFromApi });
      // const trimmedArr = [];
      // for (i = 0; i < 4; i++) {
      //   trimmedArr.push(records[i]);
      // }
      // const newArr = Array.from(records);
      // const trimmedArr = newArr.slice(1);
      // console.log('TRIMMED', trimmedArr);
      const trimmedArrOfCars = records.filter((curr, i) => i < 4 && curr);
      console.log('TRIMMED:', { trimmedArr: trimmedArrOfCars });
      res.render('index', {
        vehiclesFromApi: trimmedArrOfCars,
        isLoggedIn: req.session.user,
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
