'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';

export class NFPAAnalysisComponent {
  constructor() {
    'ngInject';
  }

  getClass(key) {
    if (this.analysis[key].grade === 'SUCCESS') return 'tx-success';
    if (this.analysis[key].grade === 'WARNING') return 'tx-warning';
    if (this.analysis[key].grade === 'DANGER') return 'tx-danger';

    return ''
  }
}

export default angular.module('directives.nfpaAnalysis', [])
  .component('nfpaAnalysis', {
    template: require('./nfpa-analysis.html'),
    controller: NFPAAnalysisComponent,
    controllerAs: 'vm',
    bindings: {
      analysis: '<',
    },
  })
  .name;
