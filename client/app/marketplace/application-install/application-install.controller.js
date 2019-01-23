'use strict';

export default class ExtensionRequestController {
  submitted = false;

  /*@ngInject*/
  constructor(Extension, currentExtension, hasRequested, AmplitudeService, AnalyticEventNames) {
    this.extension = currentExtension;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.ExtensionService = Extension;

    this.requested = hasRequested ? hasRequested.requested : false;

    if(currentExtension.image) this.extensionSrc = require(`../../../assets/images/extensions/${currentExtension.image}`);
    if(currentExtension.preview) this.extensionPreviewSrc = require(`../../../assets/images/extensions/${currentExtension.preview}`);
  }

  request() {
    this.requested = true;
    this.ExtensionService.request({ id: this.extension._id}).$promise
      .then(() => {
        this.AmplitudeService.track(this.AnalyticEventNames.APP_REQUEST, {
          app: this.extension.name,
        });
      });
  }
}
