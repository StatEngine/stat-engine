'use strict';

import { Router } from 'express';
import connectEnsureLoggedIn from 'connect-ensure-login';
import proxy from 'http-proxy-middleware';

import * as auth from '../auth/auth.service';

import settings from './kibana.settings';

const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn;

const router = new Router();

// Proxy client browser to Kibana
router.use(
  '*',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  proxy(settings)
);

module.exports = router;
