/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import config from './config/environment';

export default function(app) {
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/fireDepartments', require('./api/fire-department'));
  app.use('/api/ingest', require('./api/ingest'));

  app.use('/auth', require('./auth').default);

  // kibana
  app.route('/dashboard')
    .get((req, res) => res.redirect(path.join(config.kibana.appPath, 'app/kibana#/dashboards?_g=()')));
  app.use(config.kibana.appPath, require('./kibana'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
