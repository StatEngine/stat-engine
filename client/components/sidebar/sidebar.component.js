'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';


export class SidebarComponent {
  constructor() {
    'ngInject';
  }

  async $onInit() {
    await import(/* webpackChunkName: "bracket-plus-js" */ '../../themes/bracket-plus/js/bracket.js');
  }

}

export default angular.module('directives.sidebar', [])
  .component('sidebar', {
    template: require('./sidebar.html'),
    controller: SidebarComponent,
    controllerAs: 'vm',
  })
  .name;
