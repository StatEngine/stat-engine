'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from '@uirouter/angularjs';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';
import ngValidationMatch from 'angular-validation-match';

import angularLoadingBar from 'angular-loading-bar';
import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import api from '../components/api/api.module';

// modules
import account from './account';
import admin from './admin';
import guides from './guides';
import main from './main';
import spade from './spade';
import user from './user';

// global components
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';

import constants from './app.constants';
import util from '../components/util/util.module';
//import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('statEngineApp', [ngCookies, ngResource, ngSanitize, ngValidationMatch, ngAnimate, /*'btford.socket-io',*/ uiRouter,
  uiBootstrap, 'angular-loading-bar', _Auth, account, admin, api, guides, navbar, spade, user, modal, footer, main, constants, /*socket,*/ util,
])
  .config(routeConfig)
  .run(function($transitions) {
    'ngInject';

    $transitions.onSuccess({}, () => $('html, body').animate({ scrollTop: 0 }, 200));
  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])



angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['statEngineApp'], {
      strictDi: true
    });
  });
