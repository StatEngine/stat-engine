'use strict';

export default class ResetPasswordController {
  user = {
    email: ''
  };
  errors = {
    resetpassword: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Principal, $state) {
    this.Principal = Principal;
    this.$state = $state;
  }

  /**
  * Sends a password reset email.
  */
  resetPassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.Principal.resetpassword(this.user.email)
        .then(() => {
          this.$state.go('site.user.login');
        })
        .catch(err => {
          this.errors.resetpassword = err.data.message;
        });
    }
  }
}
