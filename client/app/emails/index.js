'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './emails.routes';
import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

// modules
import emailsSelect from './emails-select';
import emailEdit from './emails-edit';

export default angular.module('statEngineApp.emails', [uiRouter, emailsSelect, emailEdit, mongooseError])
  .config(routing)
  .name;

