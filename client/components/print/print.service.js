'use strict';

import angular from 'angular';

export function Print($window) {
  const beforePrintListeners = [];
  const afterPrintListeners = [];

  const beforePrint = () => {
    beforePrintListeners.forEach(listener => listener());
  };

  const afterPrint = () => {
    afterPrintListeners.forEach(listener => listener());
  };

  // Setup standard print hooks.
  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;

  // Safari has to use matchMedia for print hooks.
  const isSafari = (
    navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') === -1 &&
    navigator.userAgent.indexOf('FxiOS') === -1
  );

  if(isSafari && window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(mql => {
      if (mql.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }

  return {
    addBeforePrintListener(listener) {
      beforePrintListeners.push(listener);
    },

    addAfterPrintListener(listener) {
      afterPrintListeners.push(listener);
    },

    removeBeforePrintListener(listener) {
      const index = beforePrintListeners.indexOf(listener);
      if(index < 0) {
        console.warn('Could not find beforePrint listener to remove!');
        return;
      }

      beforePrintListeners.splice(index, 1);
    },

    removeAfterPrintListener(listener) {
      const index = afterPrintListeners.indexOf(listener);
      if(index < 0) {
        console.warn('Could not find afterPrint listener to remove!');
        return;
      }

      afterPrintListeners.splice(index, 1);
    },

    print() {
      // HACK: The window beforePrint hook seems to get hit too late when calling window.print(), so call it
      // manually here to make sure it runs before the page is rendered. This will have the side-effect of
      // calling beforePrint() twice, but as long as it's idempotent that should be fine.
      beforePrint();

      // We also have to wait a moment before showing the print dialog to reflect the beforePrint changes.
      setTimeout(() => {
        $window.print();
      });
    },
  };
}

export default angular.module('directives.print', [])
  .factory('Print', Print)
  .name;
