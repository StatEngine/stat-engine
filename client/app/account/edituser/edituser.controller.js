'use strict';

export default class EditUserController {
  user = {
    first_name: '',
    last_name: '',
    error: ''
  };
  errors = {
    error: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.UserService = User;
    this.$state = $state;
  }

  edituser(form) {
    this.submitted = true;
    if(form.$valid) {
      this.UserService.save({ id: this.user._id }, {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
      }).$promise
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(() => {
          form.error.$setValidity('mongoose', false);
          this.errors.error = 'Error Saving User Data. ';
        });
    }
  }
}
