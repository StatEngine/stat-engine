'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('kitchenSink', {
    url: '/kitchenSink',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown naked"></navbar>'
      },
      'content@': {
        template: require('./kitchen-sink/kitchen-sink.html'),
        controller: 'KitchenSinkController',
        controllerAs: 'vm'
      }
    },
  });

  $stateProvider.state('layoutA', {
    url: '/layoutA',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown naked"></navbar>'
      },
      'content@': {
        template: require('./layout-a/layout-a.html'),
      }
    }
  });

  $stateProvider.state('layoutB', {
    url: '/layoutB',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown naked"></navbar>'
      },
      'content@': {
        template: require('./layout-b/layout-b.html'),
      }
    }
  });

  $stateProvider.state('layoutC', {
    url: '/layoutC',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown naked"></navbar>'
      },
      'content@': {
        template: require('./layout-c/layout-c.html'),
      }
    }
  });
}
