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
import angulartics from 'angulartics';
import gtm from 'angulartics-google-tag-manager';
// eslint-disable-next-line
import angularLoadingBar from 'angular-loading-bar';

import ngSegment from 'angular-segment-analytics';

import {
  routeConfig,
} from './app.config';

import _Auth from '../components/auth/auth.module';
import api from '../components/api/api.module';

// modules
import account from './account';
import admin from './admin';
import guides from './guides';
import main from './main';
import spade from './spade';
import statEngine from './statEngine';
import user from './user';
import departmentAdmin from './department-admin';
import twitter from './twitter';
import marketplace from './marketplace';

// global components
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';

import constants from './app.constants';
import segmentEventConstants from './segment-event.constants';

import util from '../components/util/util.module';
//import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('statEngineApp', [ngCookies, ngSegment, ngResource, ngSanitize, ngValidationMatch, ngAnimate, /*'btford.socket-io',*/ uiRouter, uiBootstrap, 'angular-loading-bar',
  _Auth, account, admin, api, guides, navbar, spade, marketplace, statEngine, user, departmentAdmin, twitter, modal, footer, main, constants, segmentEventConstants, /*socket,*/ util, angulartics, gtm
])
  .config(routeConfig)
  .config((appConfig, segmentConfig, segmentProvider, SegmentEvents) => {
    segmentProvider.setKey(segmentConfig.key);
    segmentProvider.setEvents(SegmentEvents);

    if(appConfig.env === 'dev') segmentProvider.setDebug(true);
  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
  .run(($transitions, segment) => {
    'ngInject';

    $transitions.onSuccess({}, transition => {
      $('html, body').animate({ scrollTop: 0 }, 200);
      segment.page({
        path: transition.to().url
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['statEngineApp'], {
      strictDi: true
    });
  });
