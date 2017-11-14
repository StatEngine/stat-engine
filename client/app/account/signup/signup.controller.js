'use strict';

import angular from 'angular';

export default class SignupController {
  user = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;

  /*@ngInject*/
  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
  }

  register(form) {
    this.submitted = true;

    if(form.$valid) {
      return this.Auth.createUser({
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
          // Account created, redirect to home
          this.$state.go('signupSuccess');
        })
        .catch(err => {
          err = err.data;
          this.errors = {};

          // Update validity of form fields that match the sequelize errors
          if(err.name) {
            angular.forEach(err.errors, field => {
              form[field.path].$setValidity('mongoose', false);
              this.errors[field.path] = err.message;
            });
          }
        });
    }
  }
}
