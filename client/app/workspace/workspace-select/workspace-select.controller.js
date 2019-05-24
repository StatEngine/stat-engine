'use strict';

export default class WorkspaceSelectController {
  /*@ngInject*/
  constructor($window, User) {
    this.$window = $window;
    this.UserService = User;
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
    this.$window.location.href = `/workspaces/${workspace._id}/dashboard`;
  }
}
