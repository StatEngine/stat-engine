'use strict';

import angular from 'angular';
import WorkspaceEditController from './workspace-edit.controller';

export default angular.module('stateEngineApp.workspace.edit', [])
  .controller('WorkspaceEditController', WorkspaceEditController)
  .name;
