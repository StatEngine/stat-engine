/* eslint  class-methods-use-this: 0 */

import { getErrors } from '../../../util/error';

'use strict';

export default class ExposureHomeController {
  /*@ngInject*/

  constructor(Exposure) {
    this.exposureService = Exposure;
    this.errors;
    this.accessCode;
    this.fetchIAC();
  }

  fetchIAC() {
    this.exposureService.iac({}, response => {
      this.accessCode = response.iac;
    }, err => {
      console.error(err);
      this.errors = getErrors(err, 'An error occurred fetching department IAC.');
    });
  }
}
