'use strict';

import config from '../config/environment';

export default {
  target: config.kibana.uri,
  changeOrigin: true,
  logLevel: 'debug',
  // add custom headers to request
  onProxyReq: (proxyReq, req) => {
    if(req.user.FireDepartment) {
      const es_indicies = req.user.FireDepartment.get().es_indices;
      proxyReq.setHeader('x-se-fire-department-all', es_indicies.all);
    }
  },
  // Router function to direct nfors
  router: req => {
    if(req.user && req.user.nfors) {
      return config.nfors.uri;
    }
  }
};
