const axios = require('axios');

class VehiclesApi {
  constructor() {
    this.apiKey = process.env.API_KEY;
    this.api = axios.create({
      baseURL: `https://auto.dev/api/listings?apikey=${this.apiKey}`,
    });
    this.customApi = axios.create({
      baseURL: ``,
    });
  }

  getGeneralLisiting = () => {
    return this.api.get('');
  };

  getQueriedListings = (make, model, year_min, year_max, city, bodyStyle) => {
    if (model.length <= 3) {
      model = model.toUpperCase();
    } else {
      model = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
    }

    return this.api.get('', {
      params: {
        make: make,
        model: model,
        year_min: year_min,
        year_max: year_max,
        city: city,
        bodyStyle: bodyStyle,
      },
    });
  };

  getVehicleDetails = (vin) => {
    const baseUrl = this.api.defaults.baseURL;
    const indexOfQuerySign = baseUrl.indexOf('?');
    const preparedUrl = `${baseUrl.slice(
      0,
      indexOfQuerySign
    )}/${vin}${baseUrl.slice(indexOfQuerySign)}`;
    this.customApi.defaults.baseURL = preparedUrl;
    return this.customApi.get('');
  };

  getVehiclesList = async (arrayOfVins) => {
    const vehicles = [];
    for (let i = 0; i < arrayOfVins.length; i++) {
      const car = await this.getVehicleDetails(arrayOfVins[i].vin);
      car.data.clickoffUrl = arrayOfVins[i].url;
      vehicles.push(car);
    }
    return vehicles;
  };
}

module.exports = VehiclesApi;
