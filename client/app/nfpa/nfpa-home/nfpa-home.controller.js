/* eslint  class-methods-use-this: 0 */

'use strict';

export default class NFPAHomeController {
  /*@ngInject*/
  constructor(AmplitudeService, nfpaResults) {
    this.AmplitudeService = AmplitudeService;

    this.nfpaResults = nfpaResults;
    this.nfpa1710 = nfpaResults.length > 0 ? nfpaResults[0] : undefined;
  }
}
