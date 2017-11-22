'use strict';

import config from '../config/environment';

export default {
  target: config.kibana.uri,
  changeOrigin: true,
  // Strip out the appPath, so kibana sees requested path
  pathRewrite: path => {
    let newPath = path.replace(`${config.kibana.appPath}`, '');
    console.log(`Proxied to path: ${newPath}`);
    return newPath;
  },
  // add custom headers to request
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-Forwarded-User', req.user.username);

    if(req.fire_department) {
      const es_indicies = req.fire_department.get().es_indices;
      proxyReq.setHeader('x-se-fire-department-fire-incident', es_indicies['fire-incident']);
      proxyReq.setHeader('x-se-fire-department-vehicle-telemetry', es_indicies['vehicle-telemetry']);
    }
  },
  // Router function to direct nfors
  router: req => {
    if(req.user.nfors) {
      return config.nfors.uri;
    }
  }
};
