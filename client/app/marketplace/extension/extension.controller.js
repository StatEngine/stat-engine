'use strict';

import _ from 'lodash';

export default class ExtensionController {
  submitted = false;

  /*@ngInject*/
  constructor(ExtensionConfiguration, currentExtension, currentExtensionConfiguration) {
    this.extension = currentExtension;
    this.extensionConfiguration = currentExtensionConfiguration;
    this.ExtensionConfigurationService = ExtensionConfiguration;

    this.buildOptions();
  }

  buildOptions() {
    this.options = {};

    if (this.extensionConfiguration.config_json) {
      _.forEach(this.extension.config_options, option => {
        this.options[option.name] = this.extensionConfiguration.config_json[option.name];
      });
    }
  }

  enable() {
    // update
    if(this.extensionConfiguration._id) {
      this.ExtensionConfigurationService.enable({ id: this.extensionConfiguration._id, action: 'enable'}, {})
        .$promise.finally(() => this.refresh());
    // create
    } else {
      this.ExtensionConfigurationService.save({ name: this.extension.name }, {})
        .$promise.then(extensionConfiguration => {
          this.extensionConfiguration = extensionConfiguration;
          this.buildOptions();
        });
    }
  }

  disable() {
    this.ExtensionConfigurationService.disable({ id: this.extensionConfiguration._id, action: 'disable'}, {})
      .$promise.finally(() => this.refresh());
  }

  refresh() {
    this.ExtensionConfigurationService.get(
      { id: this.extensionConfiguration._id},
      extensionConfiguration => {
        this.extensionConfiguration = extensionConfiguration;
        this.buildOptions();
      }
    );
  }

  updateOptions(form) {
    this.submitted = true;

    if(form.$valid) {
      this.ExtensionConfigurationService.update({
        id: this.extensionConfiguration._id
      }, this.options)
        .$promise.finally(() => this.refresh());
    }
  }
}
