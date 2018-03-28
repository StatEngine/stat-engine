'use strict';

export default class StatEngineDocumentationController {
  /*@ngInject*/
  constructor(appConfig) {
    this.appConfig = appConfig;
    this.sectionOpen = undefined;

    this.scrollTo = function(location) {
      this.sectionOpen = location;
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };
  }
}
