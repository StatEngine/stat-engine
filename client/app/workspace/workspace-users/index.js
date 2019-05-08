'use strict';

import angular from 'angular';
import WorkspaceUsersController from './workspace-users.controller';

export default angular.module('stateEngineApp.workspace.users', [])
  .controller('WorkspaceUsersController', WorkspaceUsersController)
  .name;
