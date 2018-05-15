'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.motd', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.motd.home', {
      url: '/motd',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./motd-home/motd-home.html'),
          controller: 'MOTDHomeController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        weather(MOTD) {
          return MOTD.getTemplate({ resource2: 'weather'} ).$promise;
        },
        safetyMessage(MOTD) {
          return MOTD.getTemplate({ resource2: 'safetyMessage'}).$promise;
        },
        incidentSummary(MOTD) {
          return MOTD.getTemplate({ resource2: 'incidentSummary'}).$promise;
        },
      },
    })
    .state('site.motd.day', {
      url: '/motd/:year/:month/:day',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./motd-daily/motd-daily.html'),
          controller: 'MOTDDailyController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        dayData($http, $stateParams) {
            // $http returns a promise for the url data
            return $http({method: 'GET', url: `/api/motd/${$stateParams.year}/${$stateParams.month}/${$stateParams.day}`});
         },
         currentPrincipal(Principal) {
           return Principal.identity(true);
         },
      },
    });
}
