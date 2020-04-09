/* eslint  class-methods-use-this: 0 */

import { getErrors } from '../../../util/error';

'use strict';

export default class ExposureHomeController {
  /*@ngInject*/

  constructor($http) {
    this.$http = $http;
    this.errors;
    this.accessCode;
    this.fetchIAC();
  }

  fetchIAC() {
    this.$http.get('/api/exposure/iac')
      .then(({ data }) => {
        this.accessCode = data.iac;
      })
      .catch(err => {
        console.error(err);
        this.errors = getErrors(err, 'An error occurred fetching department IAC.');
      });
  }
}
