'use strict';

export default angular.module('statEngineApp.trusted', [])
  .filter('trusted', function($sce){
      return function(html){
          return $sce.trustAsHtml(html)
      }
   })
  .name;
