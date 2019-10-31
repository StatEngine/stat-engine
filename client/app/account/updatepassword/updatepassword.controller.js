'use strict';

import { getErrors } from '../../../util/error';

export default class UpdatePasswordController {
  user = {
    newPassword: '',
    password_token: ''
  };
  errors = {
    newPassword: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(User, $state) {
    this.UserService = User;
    this.$state = $state;
  }

  /**
  * Resets the password in the database
  */
  updatePassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.UserService.updatePassword({}, { newPassword: this.user.newPassword, password_token: this.$state.params.password_token}).$promise
        .then(() => {
          this.$state.go('site.account.login');
        })
        .catch(err => {
          this.errors = getErrors(err);
        });
    }
  }
}
