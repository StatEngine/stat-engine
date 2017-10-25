'use strict';

import main from './main.component';
import {
  MainController
} from './main.component';

describe('Component: MainComponent', function() {
  beforeEach(angular.mock.module(main));
  beforeEach(angular.mock.module('stateMock'));
  beforeEach(angular.mock.module('socketMock'));

  var scope;
  var mainComponent;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $http, $componentController, $rootScope, $state,
    socket) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    state = $state;
    mainComponent = $componentController('main', {
      $http,
      $scope: scope,
      socket
    });
  }));
});
