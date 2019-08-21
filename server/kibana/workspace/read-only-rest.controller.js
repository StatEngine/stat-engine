import nJwt from 'njwt';
import _ from 'lodash';
import axios from 'axios';

import config from '../../config/environment';

// Logins to ReadOnlyRest
export async function login(req, res) {
  const redirect = (req.query.redirect === 'true');

  res.clearCookie("rorCookie");

  if(_.isNil(req.workspace)) throw new Error('req.workspace not set');

  // firecares_id is acting as tenant until renamed in ROR settings
  const firecares_id = `${req.workspace.FireDepartment.firecares_id}_${req.workspace.slug}`;
  let roles;

  if(!req.user.isGlobal) {
    if (_.isNil(req.userWorkspace)) throw new Error('req.userWorkspace not set');
    roles = `kibana_${req.userWorkspace.permission}`;
  } else {
    roles = 'kibana_admin';
  }

  const claims = {
    sub: req.user.username,
    iss: 'https://statengine.io',
    roles,
    firecares_id,
  };

  const jwt = nJwt.create(claims, config.ror.secret);
  jwt.setExpiration(new Date().getTime() + (86400 * 1000 * 30)); // 30d
  const key = jwt.compact();

  const kibanaLoginUrl = `${config.kibana.appPath}/login`;

  // const nextUrl = '/api/saved_objects/_find?type=dashboard&search_fields=title&search=*';
  // const response = await axios.get(`http://localhost:3000/${kibanaLoginUrl}?jwt=${key}&nextUrl=${encodeURIComponent(nextUrl)}`);
  // console.log(response.data);

  if (redirect) {
    res.redirect(`${kibanaLoginUrl}?jwt=${key}`);
  } else {
    res.json({ kibanaLoginUrl: `${kibanaLoginUrl}?jwt=${key}` });
  }
}
