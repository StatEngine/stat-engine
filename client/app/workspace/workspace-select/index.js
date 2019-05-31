'use strict';

import angular from 'angular';
import WorkspaceSelectController from './workspace-select.controller';

export default angular.module('stateEngineApp.workspace.select', [])
  .controller('WorkspaceSelectController', WorkspaceSelectController)
  .name;
