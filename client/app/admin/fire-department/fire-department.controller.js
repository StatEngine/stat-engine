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
    this.file = null;

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
        this.update()
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            this.errors = getErrors(err);
          });
      } else {
        this.create()
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            this.errors = getErrors(err);
          });
      }
    }
  }

  async update() {
    if (this.file) {
      await this.upload(this.file, this.fireDepartment._id);
    }

    return this.FireDepartmentService.update({ id: this.fireDepartment._id }, this.fireDepartment).$promise;
  }

  async create() {
    this.FireDepartmentService.create(this.fireDepartment).$promise
      .then((department) => {
        this.fireDepartment = department;

        if (this.file) {
          return this.update();
        }

        return Promise.resolve();
      });
  }

  setFile(file) {
    this.file = file;
  }

  upload(file, id) {
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
