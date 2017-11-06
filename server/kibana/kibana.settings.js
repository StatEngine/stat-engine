'use strict';

import config from '../config/environment';

export default {
  target: config.kibana.uri,
  changeOrigin: true,
  // Strip out the appPath, so kibana sees requested path
  pathRewrite: path => path.replace(`${config.kibana.appPath}`, '/'),
  // add custom header to request
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-Forwarded-User', req.user.name);
  },
};
