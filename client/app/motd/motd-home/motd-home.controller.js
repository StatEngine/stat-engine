'use strict';

import _ from 'lodash';
import moment from 'moment';

export default class MOTDHomeController {
  /*@ngInject*/
  constructor(MOTD, Safety, weatherForecast, safetyMessage, stats) {
    this.MOTDService = MOTD;
    this.SafetyService = Safety;

    this.weatherForcast = weatherForecast;
    this.safetyMessage = safetyMessage.message;
    this.incidentSummary = stats.incidentSummary;
    this.unitSummary = stats.unitSummary;

    this.now = moment();
  }

  refreshWeather() {

  }

  refreshSafetyMessage() {
    this.SafetyService.getRandomMessage().$promise
      .then((safetyMessageTemplate) => {
        this.safetyMessage = safetyMessageTemplate.message;
      });
  }

  save() {
    this.MOTDService.save({
      date: {
        year: this.now.year(),
        month: this.now.month() + 1,
        date: this.now.date(),
      },
      safety: {
        message: this.safetyMessage,
      },
      weather: {
        forecast: this.weatherForcast,
        commentary: this.weatherCommentary
      },
      incidents: {
        summary: this.incidentSummary,
        commentary: this.incidentCommentary
      }
    }).$promise
      .then(() => {
        console.dir('saved!');
      });
  }
}
