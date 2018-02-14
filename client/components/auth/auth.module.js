'use strict';

import angular from 'angular';
import ngCookies from 'angular-cookies';
import uiRouter from '@uirouter/angularjs';

import constants from '../../app/app.constants';
import util from '../util/util.module';

import authInterceptor from './interceptor.service';
import routerDecorator from './router.decorator';
import PrincipalService from './principal.service';
import AuthorizationService from './authorization.service';
import UserResource from './user.service';

function addInterceptor($httpProvider) {
  'ngInject';

  $httpProvider.interceptors.push('authInterceptor');
}

export default angular.module('statEngineApp.auth', [constants, util, ngCookies, uiRouter])
  .factory('authInterceptor', authInterceptor)
  .factory('Authorization', AuthorizationService)
  .factory('Principal', PrincipalService)
  .run(routerDecorator)
  .factory('User', UserResource)
  .config(['$httpProvider', addInterceptor])
  .name;
