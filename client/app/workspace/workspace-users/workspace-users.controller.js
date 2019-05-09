'use strict';

let _;

export default class WorkspaceUsersController {
  /*@ngInject*/
  constructor(departmentUsers, currentWorkspace, Workspace) {
    this.departmentUsers = departmentUsers;
    this.workspace = currentWorkspace;
    this.WorkspaceService = Workspace;
    console.dir(this.workspace)
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    console.dir(this.departmentUsers)
    const users = _.filter(this.departmentUsers, u => !u.isAdmin && !u.isGlobal && u.isDashboardUser);
    console.dir(users)

    // merge in workspace users
    this.users = _.values(_.merge(
      _.keyBy(users, 'username'),
      _.keyBy(this.workspace.Users, 'username')
    ));
    console.dir(this.users);
  }

  grantAccess(user, level) {
    console.dir(user)
    this.WorkspaceService.updateUsers({ id: this.workspace._id }, { users: [ { _id: user._id, access: level }] }).$promise
      .then(() => alert('done'))
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
