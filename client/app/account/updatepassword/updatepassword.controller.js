'use strict';

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
  constructor(Principal, $state) {
    this.Principal = Principal;
    this.$state = $state;
  }

  /**
  * Resets the password in the database
  */
  updatePassword(form) {
    this.submitted = true;
    if(form.$valid) {
      this.Principal.updateresetPassword(this.user.newPassword, this.$state.params.password_token)
        .then(daata => {
          if(daata) {
            form.newPassword.$setValidity('mongoose', false);
            this.errors.newPassword = 'Could not reset using that password and token. ';
          } else {
            this.$state.go('site.account.login');
          }
        })
        .catch(() => {
          form.newPassword.$setValidity('mongoose', false);
          this.errors.newPassword = 'Error resetting New Password. ';
        });
    }
  }
}
