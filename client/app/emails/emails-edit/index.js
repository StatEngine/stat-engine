'use strict';

import angular from 'angular';
import EmailsEditController from './emails-edit.controller';
import AddDashboardsOverlay from '../../../components/add-dashboards-overlay/add-dashboards-overlay.component';

export default angular.module('stateEngineApp.emails.edit', [AddDashboardsOverlay])
  .controller('EmailsEditController', EmailsEditController)
  .name;
