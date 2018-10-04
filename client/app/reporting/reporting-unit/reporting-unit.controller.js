/* eslint  class-methods-use-this: 0 */

'use strict';

import { Store } from '../../../state/store';
import { autorun } from "mobx"
import _ from 'lodash';

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
}
