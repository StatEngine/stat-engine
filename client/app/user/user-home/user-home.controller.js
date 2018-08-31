'use strict';

let _;

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, $filter, $state, currentPrincipal, requestedFireDepartment, fireDepartments, User, Principal, AmplitudeService, AnalyticEventNames, appConfig) {
    this.$filter = $filter;
    this.$window = $window;
    this.$state = $state;

    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.requestedFireDepartment = requestedFireDepartment;

    this.UserService = User;
    this.PrincipalService = Principal;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.appConfig = appConfig;

    if(this.principal.isAdmin) {
      this.fireDepartments = fireDepartments;
    }
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    if(this.principal.isAdmin) {
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

    if(this.principal.isAdmin) {
      this.homeless = false;
      this.pending = false;
    }

    this.setFireDepartment = function(fd) {
      this.principal.fire_department__id = fd._id;
      this.UserService.update({ id: this.principal._id }, this.principal).$promise
        .then(() => {
          this.PrincipalService.logout();
          this.$state.go('site.main.main');
        })
        .catch(err => {
          console.error('error switching fire departments');
          console.error(err);
        });
    };

    this.dashboard = function() {
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
        app: 'Dashboard',
        location: 'user-home'
      });
      this.$window.location.href = '/dashboard';
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
  }
}
