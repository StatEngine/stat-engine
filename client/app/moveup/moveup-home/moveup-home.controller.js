/* eslint  class-methods-use-this: 0 */

'use strict';

const LOCALSTORAGE_DISMISS_KEY = 'move-up-info';

export default class MoveupHomeController {
  /*@ngInject*/

  constructor() {
    this.outputDisabled = true;
    this.coverageTime = 4;
    this.dismissed = !!localStorage.getItem(LOCALSTORAGE_DISMISS_KEY)
  }

  dismiss() {
    localStorage.setItem(LOCALSTORAGE_DISMISS_KEY, true);
  }
}