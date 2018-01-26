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
  constructor(Principal, $state, $rootScope) {
    this.Principal = Principal;
    this.$state = $state;

    this.newAccountJustCreated = ($rootScope.fromState.name == "site.account.signup");
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Principal.login({
        username: this.user.username,
        password: this.user.password
      })
        .then(() => {
          // Logged in, redirect to home
          this.$state.go('site.main.main');
        })
        .catch(err => {
          this.errors.login = err.data.message;
        });
    }
  }
}
