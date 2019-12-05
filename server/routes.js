/**
 * Main application routes
 */

'use strict';

import path from 'path';
import lusca from 'lusca';

import errors from './components/errors';
import config from './config/environment';

export default function(app) {
  // Kubernetes uses this route to ensure the service is up
  app.route('/heartbeat')
  .get((res, req) => {
    req.status(204).send();
  });

  // Insert API routes below
  app.use('/api/app', require('./api/app'));
  app.use('/api/apps', require('./api/apps'));
  app.use('/api/effective-response-force', require('./api/effective-response-force'));
  app.use('/api/email', require('./api/email'));
  app.use('/api/extensions', require('./api/extension'));
  app.use('/api/extension-configurations', require('./api/extension-configuration'));
  app.use('/api/fire-departments', require('./api/fire-department'));
  app.use('/api/incidents', require('./api/incident'));
  app.use('/api/units', require('./api/units'));
  app.use('/api/twitter', require('./api/twitter'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/reports', require('./api/report'));
  app.use('/api/weather', require('./api/weather'));
  app.use('/api/safety', require('./api/safety'));
  app.use('/api/shift', require('./api/shift'));
  app.use('/api/stats', require('./api/stats'));
  app.use('/api/workspaces', require('./api/workspace'));

  // Kibana
  app.use('/workspaces', require('./kibana/workspace'));
  app.use(config.kibana.appPath, require('./kibana'));

  app.use('/subscriptionPortal', require('./subscription'));

  // All routes after this point are csrf protected
  app.use(lusca.csrf({
    angular: true,
  }));

  // Authentication
  app.use('/auth', require('./auth').default);

  // Heatbeat POST (used to add CSRF token on login)
  app.route('/heartbeat')
  .post((res, req) => {
    req.status(204).send();
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);

    // Send an error response if one hasn't already been sent. Otherwise the reqeust will
    // fail and make the client hang.
    if (res.headersSent) {
      return;
    }

    let statusCode;
    let errors;

    if (err.errors) {
      errors = err.errors;
    } else {
      let message;
      let type;

      if (typeof(err) === 'object') {
        statusCode = err.statusCode;
        message = err.message;
        type = err.type;
      } else if (typeof(err) === 'string') {
        message = err;
      }

      errors = [{
        message: message || 'An unknown error occurred!',
        type: type || 'InternalServerError',
      }];
    }

    res.status(statusCode || 500).send({ errors });
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
    });
}
