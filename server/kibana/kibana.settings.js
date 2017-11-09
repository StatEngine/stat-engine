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
  // add custom header to request
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-Forwarded-User', req.user.email);
    proxyReq.setHeader('x-statengine-department', req.user.department);
  },
};
