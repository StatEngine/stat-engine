'use strict';

export default class MOTDHomeController {
  /*@ngInject*/
  constructor(SegmentService) {
    this.SegmentService = SegmentService;

    this.starter = 'Welcome to statengine';
  }
}
