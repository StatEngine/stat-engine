/* eslint-disable class-methods-use-this */
import request from 'request-promise';
import _ from 'lodash';
import config from '../config/environment';


export class Weather {
  _callForecastAPI(latitude, longitude, time) {
    let uri = `https://api.darksky.net/forecast/${config.dark_sky.api_token}/${latitude},${longitude}`;

    if (time) {
      uri += `,${time}`;
    }

    return request({
      uri,
      qs: {
        exclude: 'minutely'
      },
      json: true
    });
  }

  getForecast(latitude, longitude) {
    if (_.isNil(latitude)) throw new Error('latitude is required');
    if (_.isNil(longitude)) throw new Error('longitude is required');

    return this._callForecastAPI(latitude, longitude);
  }

  getHistoricForecast(latitude, longitude, time) {
    if (_.isNil(latitude)) throw new Error('latitude is required');
    if (_.isNil(longitude)) throw new Error('longitude is required');
    if (_.isNil(time)) throw new Error('time is required');

    return this._callForecastAPI(latitude, longitude, time);
  }
}

