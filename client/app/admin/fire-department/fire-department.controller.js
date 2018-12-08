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
  constructor(FireDepartment, Modal, currentFireDepartment, $state) {
    this.FireDepartmentService = FireDepartment;
    this.ModalService = Modal;

    this.fireDepartment = currentFireDepartment || {};
    this.$state = $state;
    this.timezones = [
      'US/Alaska',
      'US/Aleutian',
      'US/Arizona',
      'US/Central',
      'US/East-Indiana',
      'US/Eastern',
      'US/Hawaii',
      'US/Indiana-Starke',
      'US/Michigan',
      'US/Mountain',
      'US/Pacific',
      'US/Pacific-New',
      'US/Samoa',
      'UTC'
    ];
  }

  fixtures(type) {
    let params = {
      id: this.fireDepartment._id,
      resource2: type
    };


    this.FireDepartmentService.fixtures(params, {}).$promise
      .then(() => {
        this.ModalService.ok()('Success', 'Fixtures Loaded!');
      })
      .catch(err => {
        console.error(err);
        this.ModalService.ok()('Error', 'Fixtures Error', err);
      });
  }

  updateFireDepartment(form) {
    this.submitted = true;

    if(form.$valid) {
      if(this.fireDepartment._id) {
        this.FireDepartmentService.update({ id: this.fireDepartment._id }, this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            if(err.data.error) this.errors.error = err.data.error;
            else this.errors.error = 'Error saving data.';
          });
      } else {
        this.FireDepartmentService.create(this.fireDepartment).$promise
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
