/* eslint  class-methods-use-this: 0 */

'use strict';

import { Store } from '../../../state/store';
import { autorun } from "mobx"
import _ from 'lodash';

export default class ReportingUnitDetailController {
  /*@ngInject*/
  constructor($state) {
    this.store = Store.unitStore;
    this.$state = $state;

    autorun(() => {
      this.selected = this.store.selected;
      this.currentTotalStats = this.store.currentTotalStats;
      this.currentGranularStats = this.store.currentGranularStats;
    })
  }

  $onDestory() {
    console.dir('reminder: destroy autorunner')
  }

  selectUnit(selected) {
    this.$state.go('site.reporting.unit.detail', { id: selected.id });
  }
}
