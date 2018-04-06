'use strict';

export default class SettingsController {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    last_name: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;


  /*@ngInject*/
  constructor(User, currentPrincipal) {
    this.user = currentPrincipal;
    this.UserService = User;
  }

  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.UserService.changePassword({ id: this.user._id }, { oldPassword: this.user.oldPassword, newPassword: this.user.newPassword }).$promise
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}
