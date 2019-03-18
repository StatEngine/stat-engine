'use strict';

let _;

export default class DepartmentAdminHomeController {
  /*@ngInject*/
  constructor($location, currentPrincipal, dataQuality, departmentUsers, User) {
    this.$location = $location;
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.departmentUsers = departmentUsers;
    this.dataQuality = dataQuality;
    this.UserService = User;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.users = _.filter(this.departmentUsers, u => !u.isAdmin && !u.isGlobal);

    this.performQueryAction();
  }

  performQueryAction() {
    // Carry out any action specified in query string.
    const search = this.$location.search();
    if(search.action && search.action_username) {
      const user = this.users.find(user => user.username === search.action_username);
      if(user) {
        const userRealname = `${user.first_name} ${user.last_name}`;
        if(search.action === 'approve_dashboard_admin') {
          if(user.FireDepartment) {
            this.actionMessage = `${userRealname} has already been approved.`;
          } else {
            this.actionMessage = `Approved dashboard admin access for ${userRealname}.`;
            this.approveAccess(user);
          }

          this.actionMessageColor = 'success';
        } else if(search.action === 'approve_dashboard_readonly') {
          if(user.FireDepartment) {
            this.actionMessage = `${userRealname} has already been approved.`;
          } else {
            this.actionMessage = `Approved dashboard readonly access for ${userRealname}.`;
            this.approveAccess(user, true);
          }

          this.actionMessageColor = 'success';
        } else if(search.action === 'revoke') {
          if(user.isDepartmentAdmin || user.isIngest) {
            this.actionMessage = `Unable to revoke access for ${userRealname}.`;
          } else {
            this.revokeAccess(user);
            this.actionMessage = `Revoked access for ${userRealname}.`;
          }

          this.actionMessageColor = 'danger';
        }
      } else {
        this.actionMessage = `Could not find user with username "${search.action_username}".`;
        this.actionMessageColor = 'danger';
      }

      // Fade the action message out after a delay.
      setTimeout(() => {
        const actionMessageEl = angular.element('.action-message');
        if(actionMessageEl) {
          actionMessageEl.animate({
            opacity: 0,
          }, {
            duration: 2000,
            complete: () => {
              actionMessageEl.animate({
                height: '0',
                marginTop: '0',
              });
            },
          });
        }
      }, 6000);
    }

    // Consume action query string parameters.
    this.$location.search('action', null);
    this.$location.search('action_username', null);
  }

  refreshUsers() {
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
  }
}
