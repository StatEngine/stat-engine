'use strict';

import angular from 'angular';

export function Modal($rootScope, $uibModal) {
  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's scope
   * @param  {String} modalClass - (optional) class(es) to be applied to the modal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  function openModal({ scope = {}, modalClass = 'modal-default', enableBackdropDismiss = true }) {
    var modalScope = $rootScope.$new();
    angular.extend(modalScope, scope);

    return $uibModal.open({
      template: require('./modal.html'),
      windowClass: modalClass,
      scope: modalScope,
      backdrop: enableBackdropDismiss || 'static',
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
      showCloseButton = true,
      enableBackdropDismiss = true,
    }) {
      let modal;
      return {
        present: () => {
          modal = openModal({
            scope: {
              modal: {
                title,
                html: `<p>${content}</p>`,
                dismissable: showCloseButton,
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
            },
            enableBackdropDismiss,
          });

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
      cancelButtonText = 'Ok',
      onDismiss = angular.noop,
      showCloseButton = true,
      enableBackdropDismiss = true,
    }) {
      return service.custom({
        title,
        content,
        buttons: [{
          text: cancelButtonText,
          style: service.buttonStyle.primary,
        }],
        onDismiss,
        showCloseButton,
        enableBackdropDismiss,
      });
    },

    confirm({
      title,
      content = '',
      cancelButtonText = 'Cancel',
      cancelButtonStyle = service.buttonStyle.default,
      confirmButtonText = 'Confirm',
      confirmButtonStyle = service.buttonStyle.primary,
      onCancel = angular.noop,
      onConfirm = angular.noop,
      onDismiss = angular.noop,
      showCloseButton = true,
      enableBackdropDismiss = true,
    }) {
      return service.custom({
        title,
        content,
        buttons: [{
          text: cancelButtonText,
          style: cancelButtonStyle,
          onClick: onCancel,
        }, {
          text: confirmButtonText,
          style: confirmButtonStyle,
          onClick: onConfirm,
        }],
        onDismiss,
        showCloseButton,
        enableBackdropDismiss,
      });
    },
  };

  return service;
}

export default angular.module('directives.modal', [])
  .factory('Modal', Modal)
  .name;
