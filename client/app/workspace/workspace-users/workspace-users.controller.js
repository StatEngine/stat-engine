'use strict';

let _;

export default class WorkspaceUsersController {
  /*@ngInject*/
  constructor(Workspace, User, $stateParams, currentPrincipal) {
    this.workspaceId = $stateParams.id;

    this.WorkspaceService = Workspace;
    this.UserService = User;
    this.currentPrincipal = currentPrincipal;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async refresh() {
    this.refreshing = true;
    const departmentUsers = await this.UserService.query().$promise;
    this.workspace = await this.WorkspaceService.get({ id: this.workspaceId }).$promise;

    const users = _.filter(departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    this.users = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.workspace.Users, 'username')
    ));
    this.refreshing = false;
  }

  async $onInit() {
    await this.loadModules();
    await this.refresh();
  }

  async grantPermission(user, level) {
    this.WorkspaceService.updateUserPermissions({ id: this.workspace._id, controllerId: user._id }, { user: { _id: user._id, permission: level } }).$promise
      .then(() => this.refresh());
  }

  async revokePermission(user) {
    this.WorkspaceService.revokeUserPermissions({ id: this.workspace._id, controllerId: user._id }, { user: { _id: user._id } }).$promise
      .then(() => this.refresh());
  }

  async grantOwnership(user) {
    this.WorkspaceService.updateUserOwnership({ id: this.workspace._id, controllerId: user._id }, { user: { _id: user._id, is_owner: 'true' } }).$promise
      .then(() => this.refresh());
  }

  async revokeOwnership(user) {
    this.WorkspaceService.revokeUserOwnership({ id: this.workspace._id, controllerId: user._id }, { user: { _id: user._id } }).$promise
      .then(() => this.refresh());
  }
}
