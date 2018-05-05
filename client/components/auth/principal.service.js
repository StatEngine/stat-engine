'use strict';

import _ from 'lodash';

export default function PrincipalService($http, $q, $cookies, $window, User, segment) {
  'ngInject';

  var _identity = {};
  var _authenticated = false;
  var _segmentIdentify = false;

  return {
    isIdentityResolved() {
      return !_.isEmpty(_identity);
    },

    isAuthenticated() {
      return _authenticated;
    },

    isInRole(role) {
      if(!_authenticated || !_identity.roles) return false;
      if(_identity.roles.indexOf('admin') >= 0) return true;

      return _identity.roles.indexOf(role) >= 0;
    },

    isInAnyRole(roles) {
      if(!_authenticated || !_identity.roles) return false;

      for(var i = 0; i < roles.length; i++) {
        if(this.isInRole(roles[i])) return true;
      }

      return false;
    },

    authenticate(identity) {
      _identity = identity;
      _authenticated = !_.isEmpty(identity);

      if(_authenticated && !_segmentIdentify) {
        segment.identify(_identity._id, _identity);
        _segmentIdentify = true;
      }
    },

    login({ username, password }) {
      return $http.post('/auth/local', {
        username,
        password,
      }).then(response => {
        this.authenticate(response.data.user);
        if(response.data.redirect) $window.location.href = response.data.redirect;
        return response;
      });
    },

    logout() {
      return $http.get('/auth/local/logout')
        .finally(() => {
          this.authenticate({});
          const cookies = $cookies.getAll()
          angular.forEach(cookies, function (v, k) {
            $cookies.remove(k);
          });
          segment.identify(null);
          segment.reset();

          // invalidate server session in case kibana doesn't callback
          return $http.get('/auth/local/logout/_callback');
        });
    },

    signup(user) {
      return User.save(user).$promise;
    },

    identity(force) {
      var deferred = $q.defer();

      if(force === true) _identity = {};

      // check and see if we have retrieved the
      // currentUser data from the server. if we have,
      // reuse it by immediately resolving
      if(!_.isEmpty(_identity)) {
        deferred.resolve(_identity);

        return deferred.promise;
      }

      // otherwise, retrieve the user data from the
      // server, update the currentUser object, and then
      // resolve.
      $http.get('/auth/local')
        .then(response => {
          this.authenticate(response.data.user);
          deferred.resolve(response.data.user);
        })
        .catch(err => deferred.reject(err));

      return deferred.promise;
    },
  };
}
