'use strict';

export default class KitchenSinkController {
  /*@ngInject*/
  constructor(Modal) {
    this.Modal = Modal;
  }

  openModal() {
    this.Modal.confirm.delete(() => {})();
  }
}
