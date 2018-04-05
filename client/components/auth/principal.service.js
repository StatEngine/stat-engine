'use strict';

import _ from 'lodash';

export default function PrincipalService($http, $q, User) {
  'ngInject';

  var _identity = {};
  var _authenticated = false;
  var _passwordExt = '/password';
  var _userAPI = '/api/users/';

  return {
    isIdentityResolved() {
      return !_.isEmpty(_identity);
    },

    isAuthenticated() {
      return _authenticated;
    },

    isInRole(role) {
      if(!_authenticated || !_identity.roles) return false;

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
    },

    login({ username, password }) {
      return $http.post('/auth/local', {
        username,
        password,
      }).then(response => this.authenticate(response.data));
    },

    logout() {
      return $http.get('/auth/local/logout')
        .finally(() => {
          this.authenticate({});
          // invalidate server session in case kibana doesn't callback
          return $http.get('/auth/local/logout/_callback');
        });
    },

    signup(user) {
      return User.save(user).$promise;
    },

    edituser(user) {
      return $http.post(_userAPI + user._id, {
        user
      }).then(response => response.data);
    },

    editpassword(user, oldPassword, newPassword) {
      return $http.put(_userAPI + user._id + _passwordExt, {
        user,
        oldPassword,
        newPassword,
      }).then(response => response.data);
    },

    resetpassword(useremail) {
      return $http.put('/api/users/resetpassword', {
        useremail
      }).then(response => response.data);
    },

    updateresetPassword(newPassword, password_token) {
      return $http.put('/api/users/updatepassword', {
        newPassword, password_token
      }).then(response => response.data);
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
          this.authenticate(response.data);
          deferred.resolve(response.data);
        })
        .catch(err => deferred.reject(err));

      return deferred.promise;
    },
  };
}
