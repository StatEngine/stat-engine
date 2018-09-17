'use strict';

import { Router } from 'express';
import connectEnsureLoggedIn from 'connect-ensure-login';
import proxy from 'http-proxy-middleware';

import * as auth from '../auth/auth.service';
import settings from './kibana.settings';

const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn;

const router = new Router();

router.use(
  '*',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('kibana_ro_strict'),
  auth.hasFireDepartment,
  proxy(settings)
);

module.exports = router;
