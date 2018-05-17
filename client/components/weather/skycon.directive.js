'use strict';

import angular from 'angular';

const Skycons = require("skycons")(window)

/* Inspired by https://github.com/projectweekend/angular-skycons
  The MIT License (MIT)

  Copyright (c) 2014 Brian Hines

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export default angular.module('statEngineApp.skycon', [])
  .directive('skycon', function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            icon: "=",
            size: "=",
            animated: "=",
            color: "="
        },
        link: (scope, element, attrs) => {
          const canvas = document.createElement( "canvas" );

          if (!attrs.class ) canvas.className = "";
          else canvas.className = attrs.class;

          // set default color if "color" attribute not present
          var config = {
            color: scope.color || "black"
          };

          const skycons = new Skycons( config );

          scope.$watch('size', (newVal, oldVal) => {
            if (newVal) {
              canvas.height = newVal;
              canvas.width = newVal;
            } else {
              canvas.height = scope.size || 64;
              canvas.width = scope.size  || 64;
            }
          }, true );

            // add the animation
            skycons.add( canvas, scope.icon );

            // watch the icon property from the controller for changes
            scope.$watch( "icon", function () {
              skycons.set( canvas, scope.icon );
            }, true );

            // watch the color property from the controller for changes
            scope.$watch( "color", function () {
              skycons.color = scope.color;
            }, true );

            if (scope.animated === "false" || scope.animated === false) {
              skycons.pause();
            }
            else {
              skycons.play();
            }

            if ( element[0].nodeType === 8 ) {
              element.replaceWith( canvas );
            } else {
              element[0].appendChild( canvas );
            }

            scope.$on("$destroy", function () {
              skycons.remove(canvas);
              if (skycons.list.length === 0) {
                  skycons.pause(canvas);
              }
            });
        }
      };
  })
  .name;
