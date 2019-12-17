'use strict';

import angular from 'angular';
import { getErrors } from '../../../util/error';

export default class FireDepartmentController {
  fireDepartment = {};
  errors = {
    password: undefined,
    error: undefined
  };
  message = '';
  submitted = false;

  /*@ngInject*/
  constructor(FireDepartment, Modal, currentFireDepartment, $state, Upload) {
    this.FireDepartmentService = FireDepartment;
    this.ModalService = Modal;

    this.fireDepartment = currentFireDepartment || {};
    this.$state = $state;
    this.Upload = Upload;
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
            this.errors = getErrors(err);
          });
      } else {
        this.FireDepartmentService.create(this.fireDepartment).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            this.errors = getErrors(err);
          });
      }
    }
  }

  upload(file) {
    const id = this.fireDepartment._id;
    this.Upload.upload({
      url: `/api/fire-departments/${id}/logo`,
      data: { file: file }
    }).then((res) => {
      const imgURL = res.data.uri;
      this.fireDepartment.logo_link = imgURL;
    }, () => {
      this.errors.error = 'Error uploading logo.';
    });    
  }
}
