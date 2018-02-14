'use strict';

export default function routerDecorator($transitions, $rootScope, Authorization, Principal) {
  'ngInject';

  $transitions.onStart({ }, function(trans) {
    $rootScope.toState = trans.to();
    $rootScope.fromState = trans.from();

    if(Principal.isIdentityResolved()) {
      Authorization.authorize();
    }

    // Future spinner service
    // var SpinnerService = trans.injector().get('SpinnerService');
    //SpinnerService.transitionStart();
    //trans.promise.finally(SpinnerService.transitionEnd);
  });
}
