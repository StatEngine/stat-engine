'use strict';

export default class ExtensionRequestController {
  submitted = false;

  /*@ngInject*/
  constructor(Extension, currentExtension, hasRequested, SegmentService) {
    this.extension = currentExtension;
    this.SegmentService = SegmentService;
    this.ExtensionService = Extension;

    this.requested = hasRequested ? hasRequested.requested : false;

    if(currentExtension.image) this.extensionSrc = require(`../../../assets/images/extensions/${currentExtension.image}`);
    if(currentExtension.preview) this.extensionPreviewSrc = require(`../../../assets/images/extensions/${currentExtension.preview}`);
  }

  request() {
    this.requested = true;
    this.ExtensionService.request({ id: this.extension._id}).$promise
      .then(() => {
        this.SegmentService.track(this.SegmentService.events.APP_REQUEST, {
          app: this.extension.name,
        });
      });
  }
}
