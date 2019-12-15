/* eslint  class-methods-use-this: 0 */

'use strict';

let _;
let tippy;
let PlotlyBasic;

export default class EffectiveResponseForceAnalysisController {
  /*@ngInject*/
  constructor($scope, $location, AmplitudeService, AnalyticEventNames, currentPrincipal, formData, modules, EffectiveResponseForce) {
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

  loadResponseClass(responseClass) {
    this.selectedResponseClass = responseClass;
  }

  loadRiskCategory(riskCategory) {
    this.selectedRiskCategory = riskCategory;
    this.handleMenuClick(this.selectedResponseClass, this.selectedRiskCategory);
  }

  async loadERF(selectedType) {
    this.selectedType = selectedType;
    this.EffectiveResponseForceService.analysis({ type: this.selectedType}).$promise.then((data) => {
      this.erfAnalysis = data;
    })
  }

  handleMenuClick(responseClass, riskCategory) {
    delete this.erfAnalysis;
    this.selectedResponseClass = responseClass;
    this.selectedRiskCategory = riskCategory;
  }
}
