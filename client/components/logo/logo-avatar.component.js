'use strict';

import angular from 'angular';

export class LogoAvatarController {
  constructor() {
    'ngInject';
  }

  src() {
    if(this.department) {
      if(this.department.logo_link) return this.department.logo_link;
    }

    return '/assets/images/statengine-symbol.svg';
  }
}

export default angular.module('logoAvatar', [])
  .component('logoAvatar', {
    template: require('./logo-avatar.component.html'),
    controller: LogoAvatarController,
    controllerAs: 'vm',
    bindings: {
      department: '<',
    },
  })
  .directive('errSrc', function() {
    return {
      link: (scope, element, attrs) => {
        element.bind('error', (err) => {
          if(attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  })
  .name;

