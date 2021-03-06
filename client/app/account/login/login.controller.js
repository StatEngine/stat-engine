'use strict';

// eslint-disable-next-line no-unused-vars
import parsleyjs from 'parsleyjs';
import { getErrors } from '../../../util/error';

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
  constructor(Principal, $state, AmplitudeService, AnalyticEventNames) {
    this.Principal = Principal;
    this.$state = $state;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
  }

  $onInit() {
    this.form = $('#login-form').parsley();
  }

  login() {
    this.submitted = true;

    if(this.form.isValid()) {
      this.Principal.login({
        username: this.user.username,
        password: this.user.password
      })
        .then(res => {
          // Logged in, redirect to user home
          let user = res.data.user;

          this.AmplitudeService.track(this.AnalyticEventNames.SIGNED_IN, user);

          this.$state.go('site.user.home');
        })
        .catch(err => {
          this.errors = getErrors(err);
        });
    }
  }
}
