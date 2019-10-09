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

  updateFireDepartment(form) {
    this.submitted = true;

    if(form.$valid) {
      if(this.fireDepartment._id) {
        this.FireDepartmentService.update({ id: this.fireDepartment._id }, this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            if(err.data && err.data.errors) {
              this.errors = err.data.errors
            } else {
              this.errors = [{ message: 'An error occurred.' }]
            }
          });
      } else {
        this.FireDepartmentService.create(this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            if(err.data && err.data.errors) {
              this.errors = err.data.errors
            } else {
              this.errors = [{ message: 'An error occurred.' }]
            }
          });
      }
    }
  }
}
