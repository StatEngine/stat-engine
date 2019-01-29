'use strict';

export default class ApplicationInstallController {
  submitted = false;

  /*@ngInject*/
  constructor(currentPrincipal, Apps, currentApp, AmplitudeService, AnalyticEventNames, appInstall) {
    this.currentPrincipal = currentPrincipal;
    this.app = currentApp;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.AppsService = Apps;
    this.installed = appInstall._id ? true : false;
  }

  install() {
    this.AppsService.install({ id: this.app._id}).$promise
      .then((status) => {
        this.installed = true;
        this.AmplitudeService.track(this.AnalyticEventNames.APP_INSTALL, {
          app: this.app.name,
        });
      });
  }

  uninstall() {
    this.AppsService.uninstall({ id: this.app._id}).$promise
      .then((status) => {
        this.installed = false;
        this.AmplitudeService.track(this.AnalyticEventNames.APP_UNINSTALL, {
          app: this.app.name,
        });
      });
  }
}
