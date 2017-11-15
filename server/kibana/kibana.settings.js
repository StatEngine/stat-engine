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
    proxyReq.setHeader('X-Forwarded-User', req.user.email);

    if(req.fire_department) {
      const es_indicies = req.fire_department.get().es_indices;
      proxyReq.setHeader('x-se-fire-department-incident', es_indicies.incident);
      proxyReq.setHeader('x-se-fire-department-avl', es_indicies.avl);
    }
  },
};
