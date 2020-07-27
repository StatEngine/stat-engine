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
        this.update(this.fireDepartment, this.file)
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            this.errors = getErrors(err);
          });
      } else {
        this.create(this.fireDepartment)
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            this.errors = getErrors(err);
          });
      }
    }
  }

  async update(fireDepartment, file) {
    let url = null;
    if (file) {
      try {
        url = await this.upload(file, fireDepartment._id);
      } catch (err) {
        this.errors.error = err;
      }
    }

    return this.FireDepartmentService.update({ id: fireDepartment._id }, {
      ...fireDepartment,
      logo_link: url
    }).$promise;
  }

  async create(fireDepartment) {
    this.FireDepartmentService.create(fireDepartment).$promise
      .then((department) => {
        if (this.file) {
          return this.update(department, this.file);
        }

        return Promise.resolve();
      });
  }

  setFile(file) {
    this.file = file;
  }

  upload(file, id) {
    return new Promise((resolve, reject) => {
      this.Upload.upload({
        url: `/api/fire-departments/${id}/logo`,
        data: { file }
      }).then((res) => {
        return resolve(res.data.uri);
      }, () => {
        return reject('Error uploading logo')
      }); 
    });   
  }
}
