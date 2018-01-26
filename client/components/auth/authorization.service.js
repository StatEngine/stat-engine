'use strict';

export function AuthorizationService($rootScope, $state, Principal) {
  'ngInject';

  return {
    authorize: function() {
      return Principal.identity()
        .then(function() {
          var isAuthenticated = Principal.isAuthenticated();

          if ($rootScope.toState.data.roles &&
              $rootScope.toState.data.roles.length > 0 &&
              !Principal.isInAnyRole($rootScope.toState.data.roles)) {

              if (isAuthenticated) {
                  // user is signed in but not
                  // authorized for desired state
                  $state.go('accessdenied');
              } else {
                // user is not authenticated. Stow
                // the state they wanted before you
                // send them to the sign-in state, so
                // you can return them when you're done
                $rootScope.returnToState = $rootScope.toState;

                // now, send them to the signin state
                // so they can log in
                $state.go('signin');
              }
          }
        });
    }
  }
}
