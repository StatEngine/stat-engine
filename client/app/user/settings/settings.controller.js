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
    password: undefined,
    error: undefined
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
      this.UserService.changePassword({ id: this.user._id }, { username: this.user.username, oldPassword: this.user.oldPassword, newPassword: this.user.newPassword }).$promise
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(err => {
          if(err.data.password) {
            this.errors.password = err.data.password;
            form.password.$setValidity('mongoose', false);
          } else if(err.data.error) {
            this.errors.error = err.data.error;
          } else {
            this.errors.error = 'Error saving data.';
          }
        });
    }
  }
}
