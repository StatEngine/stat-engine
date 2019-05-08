'use strict';

let _;

export default class WorkspaceUsersController {
  /*@ngInject*/
  constructor(departmentUsers, currentWorkspace) {
    this.departmentUsers = departmentUsers;
    this.workspace = currentWorkspace;
    console.dir(this.workspace)
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    console.dir(this.departmentUsers)
    const users = _.filter(this.departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);

    // merge in workspace users
    this.users = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.workspace.Users, 'username')
    ));
    console.dir(this.users);
  }

/*  refreshUsers() {
    this.UserService.query().$promise
      .then(departmentUsers => {
        this.users = _.filter(departmentUsers, u => !u.Admin && !u.isGlobal);
      });
  }

  approveAccess(user, readonly) {
    this.UserService.approveAccess({ id: user._id, readonly }, {}).$promise
      .finally(() => {
        this.refreshUsers();
      });
  }

  revokeAccess(user) {
    this.UserService.revokeAccess({ id: user._id}, {}).$promise
      .finally(() => {
        this.refreshUsers();
      });
  }*/
}
