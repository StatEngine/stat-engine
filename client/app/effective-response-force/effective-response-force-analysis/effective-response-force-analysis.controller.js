/* eslint  class-methods-use-this: 0 */

'use strict';

let _;
let tippy;
let PlotlyBasic;

export default class EffectiveResponseForceAnalysisController {
  /*@ngInject*/
  constructor($scope, AmplitudeService, AnalyticEventNames, currentPrincipal, formData, modules, EffectiveResponseForce) {
    _ = modules._;
    tippy = modules.tippy;
    PlotlyBasic = modules.PlotlyBasic;

    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.formData = formData;
    this.EffectiveResponseForceService = EffectiveResponseForce;
  }

  $onInit() {
  }

  async loadERF() {
    this.EffectiveResponseForceService.analysis({ type: this.selectedType}).$promise.then((data) => {
      this.erfAnalysis = data;
    })
  }
}
