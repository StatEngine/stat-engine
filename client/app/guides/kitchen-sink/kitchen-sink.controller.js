'use strict';

export default class KitchenSinkController {
  /*@ngInject*/
  constructor(Modal) {
    this.Modal = Modal;
  }

  alertModal() {
    this.Modal.alert({
      title: 'Kitchen Sink',
      content: 'kitchen',
      onDismiss: () => console.log('Dismiss'),
    }).present();
  }

  deleteModal() {
    this.Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure?',
      onDismiss: () => console.log('Dismiss'),
      onConfirm: () => console.log('Delete'),
    }).present();
  }
}
