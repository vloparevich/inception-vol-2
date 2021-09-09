const axios = require('axios');

class VehiclesApi {
  constructor() {
    this.apiKey = process.env.API_KEY;
    this.api = axios.create({
      baseURL: `https://auto.dev/api/listings?apikey=${this.apiKey}`,
      //   baseURL: `https://auto.dev/api/listings?apikey=$TEST`,
    });
  }

  getGeneralLisiting = () => {
    return this.api.get('');
  };

  getQueriedListings = (make, model, year_min, year_max, city) => {
    console.log('MY REQ:', { make, model, year_min, year_max, city });
    //https://auto.dev/api/listings?apikey=KAMptQA8oJqF06&year_min=2016&make=Acura&model=MDX&trim[]=Base&trim[]=SH-AWD&city=Los%20Angeles&state=CA&location=Los%20Angeles,%20CA&latitude=34.0522342&longitude=-118.2436849&radius=100&transmission[]=automatic&features[]=sunroof&exterior_color[]=gray&exterior_color[]=silver&interior_color[]=black&page=1
    //https://auto.dev/api/listings?apikey=KAMptQA8oJqF06&year_min=2016&make=Acura&model=MDX&trim[]=Base&trim[]=SH-AWD&city=Los%20Angeles&state=CA&radius=100&transmission[]=automatic&features[]=sunroof&exterior_color[]=gray&page=1
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
