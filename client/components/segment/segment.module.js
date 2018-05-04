'use strict';

import angular from 'angular';

import SegmentService from './segment.service';

export default angular.module('statEngineApp.segment', [])
  .factory('SegmentService', SegmentService)
  .name;
