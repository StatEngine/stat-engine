/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';
import _ from 'lodash';

export default class NFPAHomeController {
  /*@ngInject*/
  constructor(SegmentService, nfpaResults) {
    this.SegmentService = SegmentService;

    this.nfpaResults = nfpaResults;
    this.nfpa1710 = nfpaResults.length > 0 ? nfpaResults[0] : undefined;
  }
}
