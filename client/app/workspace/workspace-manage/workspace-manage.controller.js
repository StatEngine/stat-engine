'use strict';

let _;

export default class WorkspaceManageController {
  /*@ngInject*/
  constructor(currentPrincipal, $state, Workspace, Modal) {
    this.currentPrincipal = currentPrincipal;

    this.$state = $state;
    this.WorkspaceService = Workspace;
    this.ModalService = Modal;
    this.initialized = false;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async refresh() {
    this.workspaces = await this.WorkspaceService.query().$promise;
    this.workspaces.forEach(wkspace => {
      console.dir(wkspace.Users)

      wkspace.owners = _.filter(wkspace.Users, u => u.UserWorkspace.is_owner && !u.isGlobal)
      wkspace.is_owner = _.map(wkspace.owners, o => o.email).indexOf(this.currentPrincipal.email) >= 0;
    });
    this.initialized = true;
  }

  async $onInit() {
    await this.loadModules();
    await this.refresh();
  }

  editWorkspace(workspace) {
    this.$state.go('site.workspace.edit', { id: workspace._id});
  }

  deleteWorkspace(workspace) {
    this.ModalService.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this workspace?<br><br><strong class="text-danger">All saved objects, such as dashboards, and visualizations will be deleted.  Workspace users will no longer be able to access!</strong>',
      onDismiss: () => console.log('Dismiss'),
      onConfirm: () => {
        this.WorkspaceService.delete({ id: workspace._id})
          .$promise.then(() => this.refresh());
      },
    }).present();
  }
}
