'use strict';

import _ from 'lodash';

export default class ExtensionRequestController {
  submitted = false;

  /*@ngInject*/
  constructor(Extension, currentExtension, hasRequested, segment) {
    this.extension = currentExtension;
    this.segment = segment;
    this.ExtensionService = Extension;

    this.requested = hasRequested ? hasRequested.requested : false;

    if (currentExtension.image) this.extensionSrc = require(`../../../assets/images/extensions/${currentExtension.image}`);
    if (currentExtension.preview) this.extensionPreviewSrc = require(`../../../assets/images/extensions/${currentExtension.preview}`);
  }

  request() {
    this.requested = true;
    this.ExtensionService.request({ id: this.extension._id}).$promise
      .then(() => {
        this.segment.track(this.segment.events.APP_REQUEST, {
          app: this.extension.name,
        });
      })
  }
}