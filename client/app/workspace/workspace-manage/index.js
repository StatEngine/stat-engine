'use strict';

import angular from 'angular';
import WorkspaceManageController from './workspace-manage.controller';

export default angular.module('stateEngineApp.workspace.manage', [])
  .controller('WorkspaceManageController', WorkspaceManageController)
  .name;
