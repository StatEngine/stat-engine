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
  constructor(Principal, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.Principal = Principal;
    this.$state = $state;
  }

  changePassword(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Principal.editpassword(this.user, this.user.oldPassword, this.user.newPassword)
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
