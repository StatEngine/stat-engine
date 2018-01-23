'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import api from '../components/api/api.module';
import account from './account';
import admin from './admin';
import guides from './guides';
import legal from './legal';
import spade from './spade';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';

import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
//import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('statEngineApp', [ngCookies, ngResource, ngSanitize, ngValidationMatch, /*'btford.socket-io',*/ uiRouter,
  uiBootstrap, _Auth, account, admin, api, guides, legal, navbar, spade, modal, footer, main, constants, /*socket,*/ util
])
  .config(routeConfig)
  .run(function($rootScope) {
    'ngInject';

    // keep track of state
    $rootScope.previousState;
    $rootScope.currentState;
    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
      $rootScope.previousState = from.name;
      $rootScope.currentState = to.name;
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['statEngineApp'], {
      strictDi: true
    });
  });
