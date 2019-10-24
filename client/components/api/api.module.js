'use strict';

import angular from 'angular';

import AppsResource from './apps.service';
import EmailResource from './email.service';
import ExtensionResource from './extension.service';
import ExtensionConfigurationResource from './extension-configuration.service';
import FireDepartmentResource from './fire-department.service';
import IncidentResource from './incident.service';
import PredictionResource from './prediction.service';
import ReportResource from './report.service';
import SafetyResource from './safety.service';
import StatsResource from './stats.service';
import TwitterResource from './twitter.service';
import UnitResource from './unit.service';
import UserResource from './user.service';
import WeatherResource from './weather.service';
import WorkspaceResource from './workspace.service';


export default angular.module('statEngineApp.api', [])
  .factory('Apps', AppsResource)
  .factory('Email', EmailResource)
  .factory('Extension', ExtensionResource)
  .factory('ExtensionConfiguration', ExtensionConfigurationResource)
  .factory('FireDepartment', FireDepartmentResource)
  .factory('Incident', IncidentResource)
  .factory('Prediction', PredictionResource)
  .factory('Report', ReportResource)
  .factory('Safety', SafetyResource)
  .factory('Stats', StatsResource)
  .factory('Twitter', TwitterResource)
  .factory('Unit', UnitResource)
  .factory('User', UserResource)
  .factory('Weather', WeatherResource)
  .factory('Workspace', WorkspaceResource)
  .name;
