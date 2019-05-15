import nJwt from 'njwt';
import _ from 'lodash';

import config from '../../config/environment';

// Logins to ReadOnlyRest
export function login(req, res) {
  res.clearCookie("rorCookie");

  if (_.isNil(req.workspace)) throw new Error('req.worspace not set');
  if (_.isNil(req.userWorkspace)) throw new Error('req.userWorkspace not set');

  let roles = `kibana_${req.userWorkspace.permission}`;
  // firecares_id is acting as tenant unti renamed in ROR settings
  let firecares_id = `${req.workspace.FireDepartment.firecares_id}_${req.workspace.slug}`;

  var claims = {
    sub: req.user.username,
    iss: 'https://statengine.io',
    roles,
    firecares_id,
  };

  console.info(claims);

  var jwt = nJwt.create(claims, config.ror.secret);
  jwt.setExpiration(new Date().getTime() + (86400 * 1000 * 30)); // 30d
  let key = jwt.compact();

  res.redirect(`${config.kibana.appPath}/login?jwt=${key}`);
}
