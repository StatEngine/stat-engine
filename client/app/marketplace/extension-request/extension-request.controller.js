'use strict';

import _ from 'lodash';

export default class ExtensionRequestController {
  submitted = false;

  /*@ngInject*/
  constructor(Extension, currentExtension) {
    this.extension = currentExtension;

    this.extensionService = Extension;
    
    this.extensionSrc = require(`../../../assets/images/extensions/${currentExtension.image}`);
    this.extensionPreviewSrc = require(`../../../assets/images/extensions/${currentExtension.preview}`);
  }

  request() {

  }
}
