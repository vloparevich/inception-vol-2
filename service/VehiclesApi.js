const axios = require('axios');

class VehiclesApi {
  constructor() {
    this.apiKey = process.env.API_KEY;
    this.api = axios.create({
      //   baseURL: `https://auto.dev/api/listings?apikey=${this.apiKey}`,
      baseURL: `https://auto.dev/api/listings?apikey=$TEST`,
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
}

module.exports = VehiclesApi;
