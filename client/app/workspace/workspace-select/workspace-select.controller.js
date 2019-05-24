'use strict';

export default class WorkspaceSelectController {
  /*@ngInject*/
  constructor($window, User, AmplitudeService, AnalyticEventNames) {
    this.$window = $window;
    this.UserService = User;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.isLoading = true;
    this.refresh();
  }

  refresh() {
    this.UserService.get().$promise.then(user => {
      this.workspaces = user.workspaces;
      this.isLoading = false;
    });
  }

  select(workspace) {
    console.dir(workspace.name)
    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
      app: 'WORKSPACE',
      workspace: workspace.name
    });
    this.$window.location.href = `/workspaces/${workspace._id}/dashboard`;
  }
}
