'use strict';

let _;

export default class WorkspaceManageController {
  /*@ngInject*/
  constructor(workspaces, currentPrincipal, $state) {
    this.workspaces = workspaces;
    this.currentPrincipal = currentPrincipal;
    this.$state = $state;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.workspaces.forEach(wkspace => {
      wkspace.owners = _.filter(wkspace.Users, u => u.UserWorkspace.is_owner)
      wkspace.is_owner = _.map(wkspace.owners, o => o.email).indexOf(this.currentPrincipal.email) >= 0;
    });
    console.dir(this.workspaces)
  }


  editWorkspace(workspace) {
    this.$state.go('site.workspace.edit', { id: workspace._id});
  }
}
