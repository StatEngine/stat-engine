'use strict';

import '../polyfills';
import './app.scss';

// these third-party vendors will be bundled in its own vendor js file by webpack
// all of these imports are loaded at initialize load (so lets keep it small and async lazyload heavy hitters)
// vendor core
import angular from 'angular';
import ngAria from 'angular-aria';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import uiRouter from '@uirouter/angularjs';
import uiBootstrap from 'angular-ui-bootstrap';

// vendor utils
import ocLazyLoad from 'oclazyLoad';
import ngValidationMatch from 'angular-validation-match';
import angularLoadingBar from 'angular-loading-bar';
import 'angular-filter-count-to/dist/angular-filter-count-to.min.js';
import 'angular-moment';
import MapBoxGL from 'mapbox-gl';

// StatEngine modules
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
      import(/* webpackChunkName: "amplitude-js" */ 'amplitude-js')
        .then(amplitude => {
          console.log('Amplitude initialized')
          amplitude.getInstance().init(amplitudeConfig.key, null, { logLevel: 'INFO'});
        })
    }
  })
  .config(['cfpLoadingBarProvider', (cfpLoadingBarProvider) => {
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
  .run(mapboxConfig => {
    MapBoxGL.accessToken = mapboxConfig.token;
  })
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
