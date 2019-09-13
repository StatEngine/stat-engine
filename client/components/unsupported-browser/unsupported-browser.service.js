'use strict';

import angular from 'angular';

export function UnsupportedBrowser($rootScope, $uibModal, AmplitudeService, AnalyticEventNames) {
  function openModal({ scope = {} }) {
    const modalScope = $rootScope.$new();
    angular.extend(modalScope, scope);

    return $uibModal.open({
      template: require('./unsupported-browser.html'),
      windowClass: 'unsupported-browser-modal',
      scope: modalScope,
      backdrop: 'static',
    });
  }

  function showWarningDialog() {
    const modal = openModal({
      scope: {
        modal: {
          supportedBrowsers: [{
            name: 'Google Chrome',
            imageUrl: '../assets/images/chrome-icon.jpg',
            downloadUrl: 'https://www.google.com/chrome/',
          }, {
            name: 'Mozilla Firefox',
            imageUrl: '../assets/images/firefox-icon.jpg',
            downloadUrl: 'https://www.mozilla.org/en-US/firefox/',
          }, {
            name: 'Microsoft Edge',
            imageUrl: '../assets/images/edge-icon.jpg',
            includedMessage: 'Included in Windows 10',
          }, {
            name: 'Apple Safari',
            imageUrl: '../assets/images/safari-icon.jpg',
            includedMessage: 'Included in macOS',
          }],

          download: browser => {
            AmplitudeService.track(AnalyticEventNames.APP_ACTION, {
              app: 'Unsupported Browser',
              action: 'download browser',
              browserName: browser.name,
            });
          },

          close: () => {
            modal.dismiss();
            AmplitudeService.track(AnalyticEventNames.APP_ACTION, {
              app: 'Unsupported Browser',
              action: 'ignore',
            });
          },
        },
      },
    });
  }

  return {
    showWarningDialog,
  }
}

export default angular.module('directives.unsupportedBrowser', [])
  .factory('UnsupportedBrowser', UnsupportedBrowser)
  .name;
