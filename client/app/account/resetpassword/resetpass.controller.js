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
        .then(data => {
          if(data) {
            this.errors.email = data;
            form.email.$setValidity('mongoose', false);
          } else {
            this.$state.go('site.account.login');
          }
        })
        .catch(() => {
          this.errors.email = 'There was an error sending email. ';
          form.email.$setValidity('mongoose', false);
        });
    }
  }
}
