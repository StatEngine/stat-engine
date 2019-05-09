'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './workspace.routes';

// modules
import workspaceSelect from './workspace-select';
import workspaceEdit from './workspace-edit';
import workspaceUsers from './workspace-users';
import workspaceManage from './workspace-manage';

export default angular.module('statEngineApp.workspace', [uiRouter, workspaceSelect, workspaceEdit, workspaceUsers, workspaceManage])
  .config(routing)
  .name;
