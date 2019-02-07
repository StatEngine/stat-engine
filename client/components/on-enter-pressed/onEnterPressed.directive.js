'use strict';

import angular from 'angular';

export default angular.module('onEnterPressed', [])
  .directive('onEnterPressed', () => {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        element.bind("keypress", (event) => {
          const keyCode = event.which || event.keyCode;

          // If enter key is pressed...
          if(keyCode === 13) {
            scope.$apply(() => {
              // Evaluate the expression.
              scope.$eval(attrs.onEnterPressed);
            });

            event.preventDefault();
          }
        });
      },
    };
  })
  .name
