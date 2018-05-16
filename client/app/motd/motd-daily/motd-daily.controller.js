'use strict';

import _ from 'lodash';

export default class MOTDDailyController {
  /*@ngInject*/
  constructor(SegmentService, motd) {
    this.motd = motd;
    this.SegmentService = SegmentService;

    console.dir(this.motd)
  }
}
