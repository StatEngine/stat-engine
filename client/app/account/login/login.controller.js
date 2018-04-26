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
  constructor(Principal, $state, segment) {
    this.Principal = Principal;
    this.$state = $state;
    this.segment = segment;
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Principal.login({
        username: this.user.username,
        password: this.user.password
      })
        .then(res => {
          // Logged in, redirect to user home
          let user = res.data.user;
          this.segment.track(this.segment.events.SIGNED_IN, user);

          this.$state.go('site.user.home');
        })
        .catch(err => {
          this.errors.login = err.data.message;
        });
    }
  }
}
