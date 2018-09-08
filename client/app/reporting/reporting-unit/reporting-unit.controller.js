/* eslint  class-methods-use-this: 0 */

'use strict';

import { Store } from '../../../state/store';
import { autorun } from "mobx"
import _ from 'lodash';
import Slideout from 'slideout';

export default class ReportingUnitController {
  /*@ngInject*/
  constructor($timeout) {
    this.store = Store.unitStore;

    autorun(() => {
      this.selected = this.store.selected;
      this.stats = this.store.selectedStats;

      $timeout(() => {})
    })
  }

  $onInit() {
      angular.element(document).ready( () => {
        this.slideout = new Slideout({
          'panel': document.getElementById('panel'),
          'menu': document.getElementById('menu'),
          'padding': 256,
          'tolerance': 70
      });
      this.slideout.open();
    });
  }

  toggle() {
    this.slideout.close();
  }
}
