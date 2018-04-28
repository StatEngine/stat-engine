'use strict';

export default function SegmentService(segment, appConfig) {
  'ngInject';

  return {
    events: segment.events,

    track(name, obj) {
      console.dir(name);
      console.dir(obj)
      obj.env = appConfig.env;
      segment.track(name, obj);
    },

    page(obj) {
      obj.env = appConfig.env;
      segment.page(obj);
    }
  }
}
