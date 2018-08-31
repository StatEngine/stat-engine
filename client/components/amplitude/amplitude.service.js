'use strict';

export default function AmplitudeService(AnalyticEventNames, appConfig) {
  'ngInject';

  return {
    track(name, obj) {
      obj.env = appConfig.env;

      import(/* webpackChunkName: "amplitude-js" */ 'amplitude-js')
        .then(amplitude => {
          amplitude.getInstance().logEvent(name, obj);
        });
    },

    page(obj) {
      obj.env = appConfig.env;
      import(/* webpackChunkName: "amplitude-js" */ 'amplitude-js')
        .then(amplitude => {
          amplitude.getInstance().logEvent(AnalyticEventNames.PAGE_LOAD, obj);
        });
    }
  };
}
