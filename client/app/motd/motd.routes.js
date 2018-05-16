'use strict';

import moment from 'moment';

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
        weatherForecast(Weather) {
          return Weather.getForecast().$promise;
        },
        safetyMessage(Safety) {
          return Safety.getRandomMessage().$promise;
        },
        stats(Stats) {
          return Stats.getDaily().$promise;
        },
      },
    })
    .state('site.motd.today', {
      url: '/motd/today',
      redirectTo: () => {
        const now = moment();
        return {
          state: 'site.motd.day',
          params: {
            year: now.year(),
            month: now.month()+1,
            date: now.date()
          }
        };
      }
    })
    .state('site.motd.history', {
      url: '/motd/history',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./motd-history/motd-history.html'),
          controller: 'MOTDHistoryController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      }
    })
    .state('site.motd.day', {
      url: '/motd/:year/:month/:date',
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
        motd(MOTD, $stateParams) {
          return MOTD.get({ year: $stateParams.year, month: $stateParams.month, date: $stateParams.date}).$promise;
        },
      },
    });
}
