'use strict';

import _ from 'lodash';

export default class MOTDHomeController {
  /*@ngInject*/
  constructor(MOTD, weather, safetyMessage, incidentSummary) {
    this.MOTDService = MOTD;

    this.weatherForcast = weather;
    this.safetyMessage = safetyMessage.message;

    this.incidentSummary = incidentSummary;

    this.myData = [
            {
                "firstName": "Cox",
                "lastName": "Carney",
              }]
  }

  refreshWeather() {

  }

  refreshSafetyMessage() {
    this.MOTDService.safetyMessageTemplate().$promise
      .then((safetyMessageTemplate) => {
        this.safetyMessage = safetyMessageTemplate.message;
      });
  }

  save() {

  }
}
