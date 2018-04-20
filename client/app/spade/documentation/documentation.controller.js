'use strict';

export default class SpadeDocumentationController {
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
