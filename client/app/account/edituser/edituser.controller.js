'use strict';

export default class EditUserController {
  user = {
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  };

  errors = {
    edituser: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Principal, $state, currentPrincipal) {
    this.user = currentPrincipal;
    this.Principal = Principal;
    this.$state = $state;
  }

  edituser(form) {
    this.submitted = true;
    if(form.$valid) {
      this.Principal.edituser({
        _id: this.user._id,
        username: this.user.username,
        email: this.user.email,
        first_name: this.user.first_name,
        last_name: this.user.last_name
      })
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(err => {
          console.log(err);
          this.errors.edituser = err.data.message;
        });
    }
  }
}
