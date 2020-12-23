'use strict';

import humanizeDuration from 'humanize-duration';
import { getErrors } from '../../../util/error';

let _;

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
});
export default class UserHomeController {
  errors = null;
  validation = null;

  /*@ngInject*/
  constructor(
    $window, $filter, $state, currentPrincipal, requestedFireDepartment, fireDepartments, User, Principal, AmplitudeService,
    AnalyticEventNames, appConfig, weatherForecast, safetyMessage, interestingIncidents, activeIncidents, yesterdayStatSummary,
    $http
  ) {
    this.$http = $http;
    this.$filter = $filter;
    this.$window = $window;
    this.$state = $state;
    this.weatherForecast = weatherForecast;
    this.safetyMessage = safetyMessage;

    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.requestedFireDepartment = requestedFireDepartment;

    this.UserService = User;
    this.PrincipalService = Principal;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.appConfig = appConfig;
    this.activeIncidents = activeIncidents;

    this.interestingIncidents = interestingIncidents;
    if(this.principal.isGlobal) {
      this.fireDepartments = fireDepartments;
    }

    this.yesterdayStatSummary = yesterdayStatSummary;

    this.selectedTab = 'incidents';

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
      app: 'Home',
      location: 'user-home',
    });
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  // eslint-disable-next-line class-methods-use-this
  humanizeDuration(ms) {
    return shortEnglishHumanizer(ms, { round: true });
  }

  async $onInit() {
    await this.loadModules();

    $('.inlinesparkline').sparkline();

    this.activeIncidents = _.values(this.activeIncidents);
    if(this.yesterdayStatSummary) {
      this.yesterdayStatSummary.summary.unit = Object.keys(this.yesterdayStatSummary.summary.unit).map(unit_id => ({ unit_id, value: this.yesterdayStatSummary.summary.unit[unit_id] }));
      // top ten
      this.yesterdayStatSummary.summary.unit = this.yesterdayStatSummary.summary.unit.slice(0, 9);
    }

    if(this.principal.isGlobal) {
      this.assignedFireDepartment = _.find(this.fireDepartments, f => f._id === this.principal.fire_department__id);
    }

    const hours = new Date().getHours();
    this.greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.gettingStarted = [
      {
        status: this.fireDepartment !== undefined,
      },
      {
        status: _.get(this.fireDepartment, 'integration_complete', false),
      },
      {
        status: _.get(this.fireDepartment, 'integration_verified', false),
      },
    ];

    // user status
    this.homeless = !this.fireDepartment && !this.requestedFireDepartment;
    this.pending = !this.fireDepartment && this.requestedFireDepartment;

    // fd status
    this.setupComplete = this.gettingStarted.every(t => t.status === true);
    this.onboarding = this.fireDepartment && !this.setupComplete;
    this.appAccess = this.fireDepartment && this.fireDepartment.integration_complete;

    if(this.principal.isGlobal) {
      this.homeless = false;
      this.pending = false;
    }

    this.setFireDepartment = (fd) => {
      this.errors = null;
      this.principal.fire_department__id = fd._id;
      this.UserService.update({ id: this.principal._id }, this.principal).$promise
        .then(() => {
          this.$state.reload();
        })
        .catch(err => {
          console.error('error switching fire departments');
          console.error(err);
          this.errors = getErrors(err);
        });
    };

    this.goto = function(state, appName) {
      this.userDropDownActive = false;

      if(appName) {
        this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
          app: appName,
          location: 'user-home'
        });
      }
      this.$state.go(state);
    };

    this.selectTab = function(tabName) {
      this.selectedTab = tabName;
    };

    await this.getValidationHealth();
  }

  async getValidationHealth() {
    try {
      const response = await this.$http.get('/api/admin/getValidationHealth');
      this.validation = {
        items: response.data.items,
        count: response.data.totalItems
      }
    } catch (err) {
      console.error(err);
      this.validation = null;
    }
  }
}
