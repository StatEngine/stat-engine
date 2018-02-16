'use strict';

import angular from 'angular';

import ExtensionConfigurationResource from './extension-configuration.service';
import ExtensionResource from './extension.service';
import FireDepartmentResource from './fire-department.service';
import TwitterResource from './twitter.service';

export default angular.module('statEngineApp.api', [])
  .factory('Extension', ExtensionResource)
  .factory('ExtensionConfiguration', ExtensionConfigurationResource)
  .factory('FireDepartment', FireDepartmentResource)
  .factory('Twitter', TwitterResource)
  .name;
