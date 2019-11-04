import angular from 'angular';

export class FooterComponent {
  constructor(appConfig, buildConfig) {
    this.appConfig = appConfig;
    this.buildConfig = buildConfig;
  }
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent,
    controllerAs: 'vm'
  })
  .name;
