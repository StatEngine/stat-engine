'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('kitchenSink', {
    url: '/kitchenSink',
    template: require('./kitchen-sink/kitchen-sink.html'),
  });

  $stateProvider.state('layoutA', {
    url: '/layoutA',
    template: require('./layout-a/layout-a.html'),
  });

  $stateProvider.state('layoutB', {
    url: '/layoutB',
    template: require('./layout-b/layout-b.html'),
  });

  $stateProvider.state('layoutC', {
    url: '/layoutC',
    template: require('./layout-c/layout-c.html'),
  });
}
