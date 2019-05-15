'use strict';

export default class WorkspaceSelectController {
  /*@ngInject*/
  constructor(currentPrincipal, $window, workspaces) {
    this.$window = $window;
    this.workspaces = workspaces;
  }

  select(workspace) {
    this.$window.location.href = `/workspaces/${workspace._id}/dashboard`;
  }
}
