'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('termsOfUse', {
    url: '/termsOfUse',
    template: require('./terms-of-use/terms-of-use.html'),
  });
}
