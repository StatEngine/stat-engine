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
      this.UserService.update({ id: this.user._id }, {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        username: this.user.username,
      }).$promise
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(err => {
          if(err.data.error) this.errors.error = err.data.error;
          else this.errors.error = 'Error saving data.';
        });
    }
  }
}
