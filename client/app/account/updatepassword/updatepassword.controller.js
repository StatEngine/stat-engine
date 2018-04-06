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
      this.UserService.updatePassword({}, { newPassword: this.user.newPassword, oldPassword: this.$state.params.password_token}).$promise
        .then(data => {
          if(data) {
            form.newPassword.$setValidity('mongoose', false);
            this.errors.newPassword = 'Could not reset using that password and token. ';
          } else {
            this.$state.go('site.account.login');
          }
        })
        .catch(err => {
          if(err.data.error) this.errors.newPassword = err.data.error;
          else this.errors.newPassword = 'Error resetting New Password. ';

          form.newPassword.$setValidity('mongoose', false);
        });
    }
  }
}
