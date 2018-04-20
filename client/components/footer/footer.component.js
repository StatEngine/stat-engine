import angular from 'angular';

export class FooterComponent {
  constructor(appConfig) {
    this.appConfig = appConfig;
  }
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent,
    controllerAs: 'vm'
  })
  .name;
