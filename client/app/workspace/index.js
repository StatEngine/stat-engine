'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './workspace.routes';
import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

// modules
import workspaceSelect from './workspace-select';
import workspaceEdit from './workspace-edit';

export default angular.module('statEngineApp.workspace', [uiRouter, workspaceSelect, workspaceEdit, mongooseError])
  .config(routing)
  .name;
