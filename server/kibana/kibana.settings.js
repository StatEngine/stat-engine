'use strict';

import nJwt from 'njwt';

import config from '../config/environment';

export default {
  target: config.kibana.uri,
  changeOrigin: true,
  logLevel: 'debug',
  // Strip out the appPath, so kibana sees requested path
  pathRewrite: (path, req) => {
    let p = path.replace(`${config.kibana.appPath}`, '');

    // inject jwt token
    if((p.indexOf('login') >= 0 || !req.cookies.rorCookie)
       && (req.user && req.user.isKibanaReadOnlyStrict)) {
      var claims = {
        sub: req.user.username,
        iss: 'https://statengine.io',
        roles: req.user.isKibanaAdmin ? 'kibana_admin' : 'kibana_ro_strict',
        firecares_id: req.user.FireDepartment.firecares_id,
      };

      var jwt = nJwt.create(claims, config.ror.secret);
      jwt.setExpiration(new Date().getTime() + (86400 * 1000 * 7)); // 7d
      let key = jwt.compact();

      // Deep linking w/ JWT https://github.com/beshu-tech/readonlyrest-docs/blob/master/kibana.md
      if(!req.cookies.rorCookie && p.indexOf('login') < 0) {
        p = `/login?jwt=${key}&nextUrl=${encodeURI(p)}`;
      } else if(p.indexOf('?') < 0) {
        p = `${p}?jwt=${key}`;
      } else {
        p = `${p}&jwt=${key}`;
      }
    }

    return p;
  },
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
