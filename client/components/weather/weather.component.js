'use strict';


import skycons from 'skycons';
skycons(window);

export class WeatherController {
  constructor() {
    'ngInject';
  }
}


export default angular.module('weather', [])
  .component('weather', {
    template: require('./weather.component.html'),
    controller: WeatherController,
    controllerAs: 'vm',
    bindings: {
      weather: '<',
      options: '<'
    },
  })
  .name;
