'use strict';

import angular from 'angular';

export default class SignupController {
  user = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;

  /*@ngInject*/
  constructor(User, $state, fireDepartments, AmplitudeService, AnalyticEventNames, $scope) {
    this.UserService = User;
    this.$state = $state;
    this.fireDepartments = fireDepartments;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
  }

  register(form) {
    this.submitted = true;

    if(form.$valid) {
      this.UserService.create({
        username: this.user.username,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        password: this.user.password,
        nfors: true,
        requested_fire_department_id: this.user.requested_fire_department_id ? this.user.requested_fire_department_id._id : undefined,
      }).$promise
        .then(() => {
          // Account created, redirect to home
          this.AmplitudeService.track(this.AnalyticEventNames.SIGNED_UP, this.user);

          this.$state.go('site.account.login');
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
