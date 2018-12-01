'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
});

export default angular.module('statEngineApp.humanize', [])
  .filter('humanizeDuration', function() {
    return function(seconds, variableResolution) {
      let options = {spacer: ''};
      if(variableResolution === true) {
        if(seconds * 1000 > 604800) {
          options.largest = 3;
        }
      }

      return shortEnglishHumanizer(seconds * 1000, options);
    };
  })
  .name;
