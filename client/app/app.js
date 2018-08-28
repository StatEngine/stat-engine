'use strict';

import 'babel-polyfill';

// core angular
import angular from 'angular';
import ngAria from 'angular-aria';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

// routing
import uiRouter from '@uirouter/angularjs';

// ui framework
import uiBootstrap from 'angular-ui-bootstrap';

// utils
import ngValidationMatch from 'angular-validation-match';
import angularLoadingBar from 'angular-loading-bar';
import 'angular-filter-count-to/dist/angular-filter-count-to.min.js';
import 'angular-moment';

// analytics
import amplitude from 'amplitude-js';

// TODO
//import 'angular-timeline/dist/angular-timeline.js';
// import angularCalendar from 'angular-bootstrap-calendar';
//import 'angular-ui-grid/ui-grid';

import {
  routeConfig,
} from './app.config';

import _Auth from '../components/auth/auth.module';
import api from '../components/api/api.module';
import amplitudeService from '../components/amplitude/amplitude.module';

// modules
import account from './account';
import admin from './admin';
import guides from './guides';
import main from './main';
import spade from './spade';
import shift from './shift';
import statEngine from './statEngine';
import user from './user';
import departmentAdmin from './department-admin';
import twitter from './twitter';
import nfpa from './nfpa';
import report from './report';
import incident from './incident';

import marketplace from './marketplace';

// global components
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';

import statsTable from '../components/tables/stats-table.component';
import safety from '../components/safety/safety.component';
import weather from '../components/weather/weather.component';
import currentWeather from '../components/weather/current-weather.component';

import skycon from '../components/weather/skycon.directive';
import logo from '../components/logo/logo.component';

import trusted from '../components/trusted/trusted.filter';
import orderObjectBy from '../components/order-object-by/order-object-by.filter';

import constants from './app.constants';
import analyticEventConstants from './analytic-event.constants';

import util from '../components/util/util.module';

import incidentComponents from '../components/incident';
import humanizeComponents from '../components/humanize/humanize-duration.filter';

import ocLazyLoad from 'oclazyLoad';

import './app.scss';

angular.module('statEngineApp', [
  ngAria,
  ngCookies,
  ngResource,
  ngSanitize,
  uiRouter,
  uiBootstrap,
  ngValidationMatch,
  'oc.lazyLoad',
  'angular-loading-bar',
  'ngCountTo',
  'angularMoment',
   _Auth,
   //angularCalendar,
   //'ui.grid',

   // se modules
   trusted,
   statsTable,
   logo,
   skycon,
   weather,
   currentWeather,
   safety,
   account,
   admin,
   api,
   guides,
   navbar,
   report,
   spade,
   marketplace,
   statEngine,
   user,
   incident,
   incidentComponents,
   orderObjectBy,
   shift,
   departmentAdmin,
   twitter,
   nfpa,
   modal,
   footer,
   main,
   analyticEventConstants,
   constants,
   amplitudeService,
   util,
   humanizeComponents
])
  .config(routeConfig)
  .config((appConfig, amplitudeConfig) => {
    if(amplitudeConfig.key) {
      amplitude.getInstance().init(amplitudeConfig.key, null, { logLevel: 'INFO'});
    }
  })
  .config(['cfpLoadingBarProvider', (cfpLoadingBarProvider) => {
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
  .run(($transitions, AmplitudeService) => {
    'ngInject';

    $transitions.onSuccess({}, transition => {
      $('html, body').animate({ scrollTop: 0 }, 200);
      AmplitudeService.page({
        path: transition.to().url
      });
    });
  })
  .constant('moment', require('moment-timezone/builds/moment-timezone-with-data-2012-2022.min'));

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['statEngineApp'], {
      strictDi: true
    });
  });
