'use strict';

import angular from 'angular';

export function PrincipalService($http, $q, User) {
  'ngInject';

  var _identity;
  var _authenticated = false;

  return {
    isIdentityResolved: function() {
      return angular.isDefined(_identity);
    },

    isAuthenticated: function() {
      return _authenticated;
    },

    isInRole: function(role) {
      if (!_authenticated || !_identity.roles) return false;

      return _identity.roles.indexOf(role) != -1;
    },

    isInAnyRole: function(roles) {
      if (!_authenticated || !_identity.roles) return false;

      for (var i = 0; i < roles.length; i++) {
        if (this.isInRole(roles[i])) return true;
      }

      return false;
    },

    authenticate: function(identity) {
      _identity = identity;
      _authenticated = identity != null;
    },

    login: function({ username, password} ) {
      var self = this;
      return $http.post('/auth/local', {
        username,
        password,
      }).then((user) => {
        self.authenticate(user);
      });
    },

    signup(user) {
      return User.save(user).$promise;
    },

    identity(force) {
      var deferred = $q.defer();

      if (force === true) _identity = undefined;

      // check and see if we have retrieved the
      // currentUser data from the server. if we have,
      // reuse it by immediately resolving
      if (angular.isDefined(_identity)) {
        deferred.resolve(_identity);

        return deferred.promise;
      }

      // otherwise, retrieve the user data from the
      // server, update the currentUser object, and then
      // resolve.
      var self = this;
      $http.get('/auth/local')
        .then((identity) => {
          self.authenticate(identity);
          deferred.resolve(identity);
        })
        .catch((err) => {
          deferred.reject(err);
        });

      return deferred.promise;
    },
  }
}
