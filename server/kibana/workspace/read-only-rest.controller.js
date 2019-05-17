import nJwt from 'njwt';
import _ from 'lodash';

import config from '../../config/environment';

// Logins to ReadOnlyRest
export function login(req, res) {
  res.clearCookie("rorCookie");

  if(_.isNil(req.workspace)) throw new Error('req.worspace not set');

  // firecares_id is acting as tenant unti renamed in ROR settings
  let firecares_id = `${req.workspace.FireDepartment.firecares_id}_${req.workspace.slug}`;
  let roles;

  if(!req.user.isGlobal) {
    if (_.isNil(req.userWorkspace)) throw new Error('req.userWorkspace not set');
    roles = `kibana_${req.userWorkspace.permission}`;
  } else {
    roles = 'kibana_admin';
  }

  var claims = {
    sub: req.user.username,
    iss: 'https://statengine.io',
    roles,
    firecares_id,
  };

  var jwt = nJwt.create(claims, config.ror.secret);
  jwt.setExpiration(new Date().getTime() + (86400 * 1000 * 30)); // 30d
  let key = jwt.compact();

  res.redirect(`${config.kibana.appPath}/login?jwt=${key}`);
}
