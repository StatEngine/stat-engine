'use strict';

import amplitude from 'amplitude-js';

export default function AmplitudeService(AnalyticEventNames, appConfig) {
  'ngInject';

  return {
    track(name, obj) {
      obj.env = appConfig.env;
      amplitude.getInstance().logEvent(name, obj);
    },

    page(obj) {
      obj.env = appConfig.env;
      amplitude.getInstance().logEvent(AnalyticEventNames.PAGE_LOAD, obj);
    }
  };
}
