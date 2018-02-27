'use strict';

import config from '../config/environment';

export default {
  target: config.kibana.uri,
  changeOrigin: true,
  logLevel: 'debug',
  // Strip out the appPath, so kibana sees requested path
  pathRewrite: path => path.replace(`${config.kibana.appPath}`, ''),
  // add custom headers to request
  onProxyReq: (proxyReq, req) => {
    if(req.user) {
      proxyReq.setHeader('X-Forwarded-User', req.user.username);
    }
    if(req.fire_department) {
      const es_indicies = req.fire_department.get().es_indices;
      proxyReq.setHeader('x-se-fire-department-all', es_indicies['all']);
    }
  },
  // Router function to direct nfors
  router: req => {
    if(req.user && req.user.nfors) {
      return config.nfors.uri;
    }
  }
};
