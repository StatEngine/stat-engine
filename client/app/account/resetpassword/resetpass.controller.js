'use strict';

export default class ResetPasswordController {
  user = {
    email: ''
  };
  errors = {
    email: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(User, $state) {
    this.UserService = User;
    this.$state = $state;
  }

  /**
  * Sends a password reset email.
  */
  resetPassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.UserService.resetPassword({}, { useremail: this.user.email }).$promise
        .then(() => {
          this.$state.go('site.account.login');
        })
        .catch(err => {
          if(err.data.error) this.errors.email = err.data.error;
          else this.errors.email = 'There was an error sending email. ';
          form.email.$setValidity('mongoose', false);
        });
    }
  }
}
