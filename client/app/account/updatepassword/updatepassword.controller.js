'use strict';

export default class UpdatePasswordController {
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
  updatePassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.Principal.updatePassword(this.user.email)
        .then(() => {
          this.$state.go('site.user.login');
        })
        .catch(err => {
          this.errors.resetpassword = err.data.message;
        });
    }
  }
}
