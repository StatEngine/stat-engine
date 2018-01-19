'use strict';

export default class UserLandingController {
  /*@ngInject*/
  constructor(Modal) {
    this.Modal = Modal;
  }

  openModal() {
    this.Modal.confirm.delete(() => {})();
  }
}
