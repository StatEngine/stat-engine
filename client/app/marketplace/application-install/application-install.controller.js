'use strict';

export default class ApplicationInstallController {
  submitted = false;

  /*@ngInject*/
  constructor(currentPrincipal, Apps, currentApp, AmplitudeService, AnalyticEventNames) {
    this.currentPrincipal = currentPrincipal;
    this.app = currentApp;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.AppsService = Apps;
  }

  request() {
    this.requested = true;
    this.AppsService.install({ id: this.app._id}).$promise
      .then(() => {
        this.AmplitudeService.track(this.AnalyticEventNames.APP_INSTALL, {
          app: this.app.name,
        });
      });
  }
}
