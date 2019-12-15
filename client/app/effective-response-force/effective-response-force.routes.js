'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.erf', {
      abstract: true,
    })
    .state('site.erf.analysis', {
      url: '/erf/analysis',
      views: {
        'content@': {
          template: require('./effective-response-force-analysis/effective-response-force-analysis.html'),
          controller: 'EffectiveResponseForceAnalysisController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        deps($ocLazyLoad) {
          return Promise.all([
            import(/* webpackChunkName: "bootstrap-js" */ 'bootstrap/dist/js/bootstrap'),
            import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid').then(() => $ocLazyLoad.inject('ui.grid')),
          ]);
        },
        async modules() {
          const modules = {};
          modules._ = await import(/* webpackChunkName: "lodash" */ 'lodash');
          modules.tippy = (await import(/* webpackChunkName: "tippy" */ 'tippy.js')).default;
          modules.PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
          return modules;
        },
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        formData(EffectiveResponseForce) {
          return EffectiveResponseForce.formData().$promise;
        },
      },
    });
}
