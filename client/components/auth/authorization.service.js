'use strict';

export default function AuthorizationService($rootScope, $state, Principal) {
  'ngInject';

  return {
    authorize() {
      return Principal.identity()
        .then(function() {
          var isAuthenticated = Principal.isAuthenticated();

          if($rootScope.toState.data.roles
             && $rootScope.toState.data.roles.length > 0
             && !Principal.isInAnyRole($rootScope.toState.data.roles)) {
            if(isAuthenticated) {
              // user is signed in but not
              // authorized for desired state
              $state.go('site.main.main');
            } else {
              // user is not authenticated. Stow
              // the state they wanted before you
              // send them to the sign-in state, so
              // you can return them when you're done
              $rootScope.returnToState = $rootScope.toState ;

              // if state hasnt been init, send to main landing
              // otherwise go to login
              if(!$state.current.name) {
                $state.go('site.main.main');
              } else {
                $state.go('site.account.login');
              }
            }
          }
        });
    }
  };
}
