import angular from 'angular';
import UnitAPI from './units';

// Create the module where our functionality can attach to
export default angular.module('services', [])
  .service('UnitsAPI', UnitAPI)
  .name;

// Services
