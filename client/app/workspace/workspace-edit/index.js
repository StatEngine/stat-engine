'use strict';

import angular from 'angular';
import WorkspaceEditController from './workspace-edit.controller';
import AddDashboardsOverlay from '../../../components/add-dashboards-overlay/add-dashboards-overlay.component';

export default angular.module('stateEngineApp.workspace.edit', [AddDashboardsOverlay])
  .controller('WorkspaceEditController', WorkspaceEditController)
  .name;
