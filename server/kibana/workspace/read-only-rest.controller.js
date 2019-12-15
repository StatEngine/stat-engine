import nJwt from 'njwt';
import _ from 'lodash';

import config from '../../config/environment';

// Builds ReadOnlyRest JWT token.
export function buildJWT({ user, workspace, userWorkspace }) {
  if(_.isNil(workspace)) throw new Error('workspace not set');

  // firecares_id is acting as tenant unti renamed in ROR settings
  let firecares_id = `${workspace.FireDepartment.firecares_id}_${workspace.slug}`;
  let roles;

  if(!user.isGlobal) {
    if (_.isNil(userWorkspace)) throw new Error('userWorkspace not set');
    roles = `kibana_${userWorkspace.permission}`;
  } else {
    roles = 'kibana_admin';
  }

  const claims = {
    sub: user.username,
    iss: 'https://statengine.io',
    roles,
    firecares_id,
  };

  const jwt = nJwt.create(claims, config.ror.secret);
  jwt.setExpiration(new Date().getTime() + (86400 * 1000 * 30)); // 30d

  return jwt.compact();
}

// redirects user to kibana login page.  By attaching the rorJWT this will affectively login in the user seamlessly, and store rorCookie in the browser
export function login(req, res) {
  const rorJwt = buildJWT({
    user: req.user,
    workspace: req.workspace,
    userWorkspace: req.userWorkspace,
  });
  return res.redirect(`${config.kibana.appPath}/login?jwt=${rorJwt}`);
}

// logouts a kibana session by clearing the rorCookie
export function logout(req, res, next) {
  res.clearCookie("rorCookie");
  next();
}
