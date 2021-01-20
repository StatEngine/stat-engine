'use strict';

import angular from 'angular';

export class ValidationCheckComponent {
  discoverUrl = "/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!f,value:5000),time:(from:now-5y,mode:quick,to:now))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,interval:auto,query:(language:lucene,query:''),sort:!(description.event_opened,desc))";
}

export default angular.module('validationCheck', [])
  .component('validationCheck', {
    template: require('./validation-check.html'),
    controller: ValidationCheckComponent,
    controllerAs: 'vm',
    bindings: {
      incidents: '<',
    },
  })
  .name;
