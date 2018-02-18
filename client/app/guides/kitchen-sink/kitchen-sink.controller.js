'use strict';

export default class KitchenSinkController {
  /*@ngInject*/
  constructor(Modal) {
    this.Modal = Modal;
  }

  okModal() {
    this.Modal.ok()('Kitchen Sink', 'kitchen');
  }

  deleteModal() {
    this.Modal.confirm.delete(() => {})();
  }
}
