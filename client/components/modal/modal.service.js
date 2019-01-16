'use strict';

import angular from 'angular';

export function Modal($rootScope, $uibModal) {
  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's scope
   * @param  {String} modalClass - (optional) class(es) to be applied to the modal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  function openModal(scope = {}, modalClass = 'modal-default') {
    var modalScope = $rootScope.$new();
    angular.extend(modalScope, scope);

    return $uibModal.open({
      template: require('./modal.html'),
      windowClass: modalClass,
      scope: modalScope
    });
  }

  // Public API here
  const service = {
    buttonStyle: {
      primary: 'btn-primary',
      success: 'btn-success',
      danger: 'btn-danger',
      default: 'btn-default',
    },

    custom({
      title,
      content = '',
      buttons = [],
      onDismiss = angular.noop,
    }) {
      let modal;
      return {
        present: () => {
          modal = openModal({
            modal: {
              dismissable: true,
              title,
              html: `<p>${content}</p>`,
              buttons: buttons.map(button => ({
                classes: button.style || service.buttonStyle.default,
                text: button.text,
                click: (e) => {
                  if (button.onClick) {
                    button.onClick(e);
                  }
                  if (_.isUndefined(button.dismisses) || button.dismisses) {
                    modal.dismiss();
                  }
                },
              })),
            },
          }, 'modal-default');

          // Call onDismiss() when the modal closes for any reason.
          modal.result
            .catch(angular.noop)
            .then(() => {
              onDismiss();
              modal = null;
            });
        },
        dismiss: () => {
          if (modal) {
            modal.dismiss();
          }
        },
      };
    },

    alert({
      title,
      content = '',
      closeButtonText = 'Ok',
      onDismiss = angular.noop,
    }) {
      return service.custom({
        title,
        content,
        buttons: [{
          text: closeButtonText,
          style: service.buttonStyle.primary,
        }],
        onDismiss,
      });
    },

    confirm({
      title,
      content = '',
      cancelButtonText = 'Cancel',
      cancelButtonStyle = service.buttonStyle.default,
      confirmButtonText = 'Confirm',
      confirmButtonStyle = service.buttonStyle.primary,
      onDismiss = angular.noop,
      onConfirm = angular.noop,
    }) {
      return service.custom({
        title,
        content,
        buttons: [{
          text: cancelButtonText,
        }, {
          text: confirmButtonText,
          style: confirmButtonStyle,
          onClick: onConfirm,
        }],
        onDismiss,
      });
    },
  };

  return service;
}

export default angular.module('directives.modal', [])
  .factory('Modal', Modal)
  .name;
