'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.user', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.user.home', {
      url: '/home',
      template: require('./user-home/user-home.html'),
      controller: 'UserHomeController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        currentFireDepartment($q, FireDepartment, currentPrincipal) {
          if(currentPrincipal.fire_department__id) {
            return FireDepartment.get({ _id: currentPrincipal.fire_department__id }).$promise;
          } else {
            return undefined;
          }
        },
        dataQuality(FireDepartment, currentFireDepartment) {
          if(currentFireDepartment) {
            return FireDepartment.dataQuality({ id: currentFireDepartment.firecares_id, type: 'fire-incident'});
          } else {
            return undefined;
          }
        },
        twitterExtensionConfiguration(ExtensionConfiguration) {
          return ExtensionConfiguration.get({ name: 'Twitter', limit: 1 }).$promise;
        },
        tweets: function(twitterExtensionConfiguration, Twitter) {
          console.dir(twitterExtensionConfiguration)
          if (twitterExtensionConfiguration._id) return Twitter.getTweets().$promise;
          else return [];
        },
      },
      controllerAs: 'vm'
    });
}
