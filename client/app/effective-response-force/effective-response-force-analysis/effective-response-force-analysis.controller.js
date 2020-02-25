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

    this.selectedYear = formData.years[0];

    if (formData.response_classes.length) {
      this.loadResponseClass(formData.response_classes[0]);
      this.loadRiskCategory(formData.response_classes[0].risk_categories[0]);
      this.selectedType = formData.response_classes[0].risk_categories[0].dispatch_types[0];
      this.loadERF();
    }
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
    if (selectedType) this.selectedType = selectedType;

    this.EffectiveResponseForceService.analysis({
      type: this.selectedType,
      risk_category: this.selectedRiskCategory.key,
      response_class: this.selectedResponseClass.key,
      year: this.selectedYear,
    }).$promise.then((data) => {
      this.erfAnalysis = data;
    })
  }

  handleMenuClick(responseClass, riskCategory) {
    delete this.erfAnalysis;
    this.selectedResponseClass = responseClass;
    this.selectedRiskCategory = riskCategory;
    console.dir(this)
  }
}
