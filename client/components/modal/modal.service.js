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
  return {
    /* Confirmation modals */
    ok() {
      return function(...args) {
        var title = args.shift();
        var msg = args.shift();
        var error = args.shift() || false;

        var okModal;
        okModal = openModal({
          modal: {
            dismissable: true,
            title: `${title}`,
            html: `<p>${msg}</p>`,
            buttons: [{
              classes: error ? 'btn-danger' : 'btn-success',
              text: 'Ok',
              click(e) {
                okModal.close(e);
              }
            }]
          }
        }, 'modal-success');
      };
    },

    /* Confirmation modals */
    confirm: {

      /**
       * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
       * @param  {Function} del - callback, ran when delete is confirmed
       * @return {Function}     - the function to open the modal (ex. myModalFn)
       */
      delete(del = angular.noop) {
        /**
         * Open a delete confirmation modal
         * @param  {String} name   - name or info to show on modal
         * @param  {All}           - any additional args are passed straight to del callback
         */
        return function(...args) {
          var name = args.shift();
          var deleteModal;
          deleteModal = openModal({
            modal: {
              dismissable: true,
              title: 'Confirm Delete',
              html: `<p>Are you sure you want to delete <strong>${name}</strong> ?</p>`,
              buttons: [{
                classes: 'btn-danger',
                text: 'Delete',
                click(e) {
                  deleteModal.close(e);
                }
              }, {
                classes: 'btn-default',
                text: 'Cancel',
                click(e) {
                  deleteModal.dismiss(e);
                }
              }]
            }
          }, 'modal-danger');

          deleteModal.result.then(function(event) {
            del.apply(event, args);
          });
        };
      }
    }
  };
}

export default angular.module('directives.modal', [])
  .factory('Modal', Modal)
  .name;
