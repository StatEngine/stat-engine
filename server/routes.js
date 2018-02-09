/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import config from './config/environment';
import lusca from 'lusca';

export default function(app) {
  // Insert API routes below
  app.use('/api/extensions', require('./api/extension'));
  console.dir(require('./api/extension-configuration'));
  app.use('/api/extension-configurations', require('./api/extension-configuration'));
  app.use('/api/fire-departments', require('./api/fire-department'));
  app.use('/api/tweets', require('./api/tweet'));
  app.use('/api/users', require('./api/user'));

  // All routes after this point are csrf protected
  app.use(lusca.csrf({
    angular: true
  }));

  // Authentication
  app.use('/auth', require('./auth').default);

  // Kibana
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
