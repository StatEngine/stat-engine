export default class UnitAPI {
  constructor($http) {
    'ngInject';

    this._$http = $http;
    console.dir($http)
  }
}
