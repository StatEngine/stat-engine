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
  constructor(User, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.UserService = User;
    this.$state = $state;
  }

  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.UserService.changePassword({ id: this.user._id }, { oldPassword: this.user.oldPassword, newPassword: this.user.newPassword }).$promise
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
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
