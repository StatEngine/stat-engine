'use strict';

import _ from 'lodash';

export default class RequestAccessController {
  /*@ngInject*/
  constructor($state, currentPrincipal, requestedFireDepartment, fireDepartments, User) {
    this.$state = $state;
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.fireDepartments = fireDepartments;
    this.UserService = User;
    this.requestedFireDepartment = requestedFireDepartment;
  }

  requestAccess($state, form) {
    this.UserService.requestAccess({ id: this.principal._id }, { requested_fire_department_id: this.selectedFireDepartment, username: this.principal.username }).$promise
      .then(() => {
        this.$state.go('site.user.home');
      })
      .catch((err) => {
        console.dir(err)
        this.message = 'An error occurred while requesting access';
      });
  }
}
