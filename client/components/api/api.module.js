'use strict';

import angular from 'angular';

import ExtensionConfigurationResource from './extension-configuration.service';
import ExtensionResource from './extension.service';
import FireDepartmentResource from './fire-department.service';
import TweetResource from './tweet.service';

export default angular.module('statEngineApp.api', [])
  .factory('Extension', ExtensionResource)
  .factory('ExtensionConfiguration', ExtensionConfigurationResource)
  .factory('FireDepartment', FireDepartmentResource)
  .factory('Tweet', TweetResource)
  .name;
