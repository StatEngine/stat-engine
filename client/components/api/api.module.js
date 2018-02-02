'use strict';

import angular from 'angular';

import {
  FireDepartmentResource
} from './fire-department.service';

import {
  TweetResource
} from './tweet.service';

export default angular.module('statEngineApp.api', [])
  .factory('FireDepartment', FireDepartmentResource)
  .factory('Tweet', TweetResource)
  .name;
