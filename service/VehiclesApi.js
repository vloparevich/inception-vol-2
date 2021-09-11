const axios = require('axios');

class VehiclesApi {
  constructor() {
    this.apiKey = process.env.API_KEY;
    this.api = axios.create({
      baseURL: `https://auto.dev/api/listings?apikey=${this.apiKey}`,
      //   baseURL: `https://auto.dev/api/listings?apikey=$TEST`,
    });
    this.customApi = axios.create({
      baseURL: ``,
    });
  }

  getGeneralLisiting = () => {
    return this.api.get('');
  };

  getQueriedListings = (make, model, year_min, year_max, city) => {
    return this.api.get('', {
      params: {
        make: make,
        model: model,
        year_min: year_min,
        year_max: year_max,
        city: city,
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
}

module.exports = VehiclesApi;
