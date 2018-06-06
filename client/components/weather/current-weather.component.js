'use strict';

import angular from 'angular';

import skycons from 'skycons';

skycons(window);

export class CurrentWeatherController {
  constructor() {
    'ngInject';
  }
}


export default angular.module('currentWeather', [])
  .component('currentWeather', {
    template: require('./current-weather.component.html'),
    controller: CurrentWeatherController,
    controllerAs: 'vm',
    bindings: {
      weather: '<',
      options: '<'
    },
  })
  .name;
