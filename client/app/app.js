'use strict';

// these third-party vendors will be bundled in its own vendor js file by webpack
// all of these imports are loaded at initialize load (so lets keep it small and async lazyload heavy hitters)
// vendor core
import angular from 'angular';
import ngAria from 'angular-aria';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import uiRouter from '@uirouter/angularjs';
import ngFileUpload from 'ng-file-upload';

// eslint-disable-next-line no-unused-vars
import uiBootstrap from 'ui-bootstrap4';
// eslint-disable-next-line no-unused-vars
import bootstrap from 'bootstrap';

import spectrum from 'spectrum-colorpicker/spectrum';
import spectrumColorPicker from 'angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.js';

// vendor utils
// eslint-disable-next-line no-unused-vars
import oclazyload from 'oclazyload';
// eslint-disable-next-line no-unused-vars
import angularLoadingBar from 'angular-loading-bar';
// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
// eslint-disable-next-line no-unused-vars
import sparkline from 'jquery-sparkline/jquery.sparkline.js';

import 'angular-filter-count-to/dist/angular-filter-count-to.min.js';
import 'angular-moment';
import 'hammerjs';
import MapBoxGL from 'mapbox-gl';

import '../polyfills';
import './app.scss';

// eslint-disable-next-line no-unused-vars
import { Store } from '../state/store';

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
//import shift from './shift';
import statEngine from './statEngine';
import user from './user';
import reporting from './reporting';
import departmentAdmin from './department-admin';
import twitter from './twitter';
import report from './report';
import incident from './incident';
import erf from './effective-response-force';

import workspace from './workspace';

import marketplace from './marketplace';

// global components
import appbar from '../components/appbar/appbar.component';
import navbar from '../components/navbar/navbar.component';
import plotlyWrapper from '../components/plotly-wrapper/plotly-wrapper.component';
import sidebar from '../components/sidebar/sidebar.component';
import footer from '../components/footer/footer.component';
import percentChange from '../components/percent-change/percent-change.component';
import rank from '../components/rank/rank.component';
import modal from '../components/modal/modal.service';
import shift from '../components/shift/shift.component';
import onEnterPressed from '../components/on-enter-pressed/onEnterPressed.directive';
import loadingSpinner from '../components/loading-spinner/loading-spinner.component';
import loadingOverlay from '../components/loading-overlay/loading-overlay.component';
import print from '../components/print/print.service';

import statsTable from '../components/tables/stats-table.component';
import safety from '../components/safety/safety.component';
import weather from '../components/weather/weather.component';
import currentWeather from '../components/weather/current-weather.component';
import chartTable from '../components/chart-table/chart-table.component';
import barGauge from '../components/bar-gauge/bar-gauge.component';
import skycon from '../components/weather/skycon.directive';
import logo from '../components/logo/logo.component';
import logoAvatar from '../components/logo/logo-avatar.component';

import nfpaAnalysis from '../components/nfpa-analysis/nfpa-analysis.component';
import bulletChart from '../components/bullet-chart/bullet-chart.component';

import trusted from '../components/trusted/trusted.filter';
import orderObjectBy from '../components/order-object-by/order-object-by.filter';

import constants from './app.constants';
import analyticEventConstants from './analytic-event.constants';

import util from '../components/util/util.module';

import incidentComponents from '../components/incident';
import chartComponents from '../components/chart';
import humanizeComponents from '../components/humanize/humanize-duration.filter';

import reportingUnitList from '../components/reporting-unit-list/reporting-unit-list.component';
import toggleSwitch from '../components/toggle-switch/toggle-switch.component';
import unsupportedBrowser from '../components/unsupported-browser/unsupported-browser.service';
import chip from '../components/chip/chip.component';

angular.module('statEngineApp', [
  ngAria,
  ngCookies,
  ngResource,
  ngSanitize,
  uiRouter,
  ngFileUpload,
  'oc.lazyLoad',
  'angular-loading-bar',
  'ngCountTo',
  'angularMoment',
  'angularSpectrumColorpicker',
  _Auth,
  // se modules
  trusted,
  statsTable,
  logo,
  logoAvatar,
  skycon,
  weather,
  currentWeather,
  chartTable,
  barGauge,
  safety,
  account,
  admin,
  api,
  guides,
  appbar,
  navbar,
  sidebar,
  report,
  spade,
  marketplace,
  statEngine,
  user,
  incident,
  workspace,
  incidentComponents,
  chartComponents,
  orderObjectBy,
  shift,
  departmentAdmin,
  twitter,
  'ui.bootstrap',
  footer,
  main,
  analyticEventConstants,
  constants,
  amplitudeService,
  util,
  humanizeComponents,
  reporting,
  reportingUnitList,
  plotlyWrapper,
  modal,
  percentChange,
  nfpaAnalysis,
  bulletChart,
  rank,
  onEnterPressed,
  loadingSpinner,
  loadingOverlay,
  toggleSwitch,
  print,
  unsupportedBrowser,
  chip,
  erf,
])
  .config(routeConfig)
  .config(buildConfig => {
    console.debug(`Currently running version: ${buildConfig.version} (${buildConfig.versionDate})`)
  })
  .config((appConfig, amplitudeConfig) => {
    if(amplitudeConfig.key) {
      import(/* webpackChunkName: "amplitude-js" */ 'amplitude-js')
        .then(amplitude => {
          amplitude.getInstance().init(amplitudeConfig.key, null, { logLevel: 'INFO'});
        });
    }
  })
  .config(['cfpLoadingBarProvider', cfpLoadingBarProvider => {
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
