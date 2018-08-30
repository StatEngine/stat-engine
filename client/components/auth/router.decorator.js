'use strict';

export default function routerDecorator($transitions, $rootScope, Authorization, Principal) {
  'ngInject';

  $transitions.onStart({ }, function(trans) {
    $rootScope.toState = trans.to();
    $rootScope.fromState = trans.from();

    return Principal.init()
      .then(() => {
        if(Principal.isIdentityResolved()) {
          Authorization.authorize();
        }
      })
    }
  );
}
