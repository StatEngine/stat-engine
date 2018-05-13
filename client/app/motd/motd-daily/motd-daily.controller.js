'use strict';

import _ from 'lodash';
import data from './safetyMessages.js';

let http;

export default class MOTDDailyController {
  /*@ngInject*/
  constructor(SegmentService, dayData, $http, $stateParams, Principal) {
    http = $http;
    this.SegmentService = SegmentService;
    this.year = $stateParams.year;
    this.month = $stateParams.month;
    this.day = $stateParams.day;
    this.edit = $stateParams.edit;
    this.principal = Principal;
    this.data = dayData.data;

    // TODO isDepartmentAdmin is not resolving
    this.principal.isDepartmentAdmin = true;

    if(this.data) {
      this.safetyMessage = this.data.config.safetyMessage;
      this.weatherData = this.data.config.weatherData;
      this.trainingMessage = this.data.config.trainingMessage;
    }

    this.logoUrl = 'https://s3.amazonaws.com/statengine-public-assets/richmond.png';

    //this.buildContent();
    this.save = function(section) {
      const self = this;
      return $http.post(
        `/api/motd/${this.year}/${this.month}/${this.day}`,
        {
          date: `${this.year}/${this.month}/${this.day}`,
          config: {
            safetyMessage: this.safetyMessage,
            weatherData: this.weatherData,
            trainingMessage: this.trainingMessage,
          }
        }
      ).then(function() {
        self.edit = false;

        if(section) {
          self[section] = false;
        }
      });
    };

  }

  _addParagraph(text, options) {
    let bold = _.get(options, 'bold');

    let p = '<p>'
    if (bold) p += '<b>';
    p += text;
    if (bold) p += '</b>';
    p + '</p>';

    this.content += p;
  }

  _addImage(uri, options) {
    let p = '<p>';

    p += `<img src="${uri}" style="width: 250px;">`;

    p + '</p>';

    this.content += p;
  }

  safety() {
    this._addParagraph(this.safetyMessage, { bold: false });
  }

  getRandomSafetyMessage() {
    this.safetyMessage = `<p>${data[Math.floor(Math.random() * data.length)]}</p>`;
  }

  logo() {
    this._addImage(this.logoUrl);
  }

  // weather() {
  //   this._addParagraph('Weather', { bold: true });
  //   this._addParagraph(this.weatherForecast, { bold: false });
  // }

  buildContent() {
    //this.logo();
    this.safety();
    //this.weather();
  }

  getWeather() {
    const self = this;
    return http.get('/api/motd/weather')
      .then(function(res) {
        self.weatherData = res.data;
      });
  };

  clearContent(section) {
    this.content = '';
  }
}
