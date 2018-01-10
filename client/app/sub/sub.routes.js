'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('kitchenSink', {
    url: '/kitchenSink',
    template: require('./kitchen-sink/kitchen-sink.html'),
  });
}
