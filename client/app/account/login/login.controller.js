'use strict';

export default class LoginController {
  user = {
    username: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Principal, $state) {
    this.Principal = Principal;
    this.$state = $state;
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Principal.login({
        username: this.user.username,
        password: this.user.password
      })
        .then(() => {
          // Logged in, redirect to user home
          this.$state.go('site.user.home');
        })
        .catch(err => {
          this.errors.login = err.data.message;
        });
    }
  }
}
