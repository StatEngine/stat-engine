'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';

export default angular.module('statEngineApp.humanize', [])
  .filter('humanizeDuration', function() {
    return function(seconds) {
      return humanizeDuration(seconds * 1000);
    };
  })
  .name;
