'use strict';

import angular from 'angular';
import mapboxgl from 'mapbox-gl';
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

// eslint-disable-next-line
import pdfMake from 'pdfmake/build/pdfmake';
// eslint-disable-next-line
import pdfFonts from 'pdfmake/build/vfs_fonts';
// eslint-disable-next-line
import html2canvas from 'html2canvas';

import 'angular-filter-count-to/dist/angular-filter-count-to.min.js';

import 'angular-summernote/dist/angular-summernote.min.js';
import 'angular-timeline/dist/angular-timeline.js';
import angularCalendar from 'angular-bootstrap-calendar';

import 'summernote';
import 'bootstrap/dist/js/bootstrap.js';
import 'angular-moment';
import 'angular-ui-grid';

import {
  routeConfig,
} from './app.config';

import _Auth from '../components/auth/auth.module';
import api from '../components/api/api.module';
import segmentService from '../components/segment/segment.module';

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
import timeline from '../components/timeline/timeline.directive';
import logo from '../components/logo/logo.component';

import trusted from '../components/trusted/trusted.filter';
import orderObjectBy from '../components/order-object-by/order-object-by.filter';

import constants from './app.constants';
import segmentEventConstants from './segment-event.constants';

import util from '../components/util/util.module';
//import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('statEngineApp', [ngCookies, ngSegment, ngResource, ngSanitize, ngValidationMatch, ngAnimate, /*'btford.socket-io',*/ uiRouter, uiBootstrap, 'angular-loading-bar',
  'ngCountTo', 'angularMoment', _Auth, angularCalendar, 'ui.grid', trusted, statsTable, logo, skycon, weather, currentWeather, safety, 'summernote', 'angular-timeline', account, admin, api, guides, navbar, report,
  spade, marketplace, statEngine, user, timeline, incident, orderObjectBy, shift, departmentAdmin, twitter, nfpa, modal, footer, main, segmentEventConstants, constants, segmentService,
  /*socket,*/ util, angulartics, gtm
])
  .config(routeConfig)
  .config((appConfig, segmentConfig, segmentProvider, SegmentEvents) => {
    if(segmentConfig.key) {
      segmentProvider.setKey(segmentConfig.key);
    }
    segmentProvider.setEvents(SegmentEvents);
    segmentProvider.setDebug(true);
  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.latencyThreshold = 100;
  }])
  .run(mapboxConfig => {
    mapboxgl.accessToken = mapboxConfig.token;
  })
  .run(($transitions, SegmentService) => {
    'ngInject';

    $transitions.onSuccess({}, transition => {
      $('html, body').animate({ scrollTop: 0 }, 200);
      SegmentService.page({
        path: transition.to().url
      });
    });
  })
  .constant('moment', require('moment-timezone/builds/moment-timezone-with-data-2012-2022'));

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['statEngineApp'], {
      strictDi: true
    });
  });
