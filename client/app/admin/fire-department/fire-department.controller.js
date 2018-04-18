'use strict';

import angular from 'angular';

export default class FireDepartmentController {
  fireDepartment = {};
  errors = {
    password: undefined,
    error: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(FireDepartment, currentFireDepartment, $state) {
    this.FireDeparmtentService = FireDepartment;
    this.fireDepartment = currentFireDepartment || {};
    this.$state = $state;
  }

  updateFireDepartment(form) {
    this.submitted = true;

    if(form.$valid) {
      if(this.fireDepartment._id) {
        this.FireDeparmtentService.update({ id: this.fireDepartment._id }, this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            if(err.data.error) this.errors.error = err.data.error;
            else this.errors.error = 'Error saving data.';
          });
      } else {
        this.FireDeparmtentService.create(this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
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
}
