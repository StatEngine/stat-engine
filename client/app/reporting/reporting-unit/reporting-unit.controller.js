/* eslint  class-methods-use-this: 0 */

'use strict';

import { Store } from '../../../state/store';
import { autorun } from "mobx"
import _ from 'lodash';

export default class ReportingUnitController {
  /*@ngInject*/
  constructor($state) {
    this.store = Store.unitStore;
    this.$state = $state;
  }

  $onDestory() {
    console.dir('reminder: destroy autorunner')
  }

  selectUnit(selected) {
    this.$state.go('site.reporting.unit.detail', { id: selected.id });
  }
}
