/* eslint  class-methods-use-this: 0 */

'use strict';

import { Store } from '../../../state/store';
import { autorun } from "mobx"
import _ from 'lodash';

export default class ReportingHomeController {
  /*@ngInject*/
  constructor($timeout) {
    this.store = Store.unitStore;

    setInterval(() => {
      console.dir("selecting");
      this.store.selectUnit('E2')
    }, 5000)

    autorun(() => {
      this.selectedUnit = this.store.selectedUnit;
      $timeout(() => {})
    })
  }
}
