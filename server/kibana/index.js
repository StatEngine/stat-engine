'use strict';

import { Router } from 'express';

import * as auth from '../auth/auth.service';
import settings from './kibana.settings';
import connectEnsureLoggedIn from 'connect-ensure-login';

const proxy = require('http-proxy-middleware');
const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn

const router = new Router();

router.use(
  '*',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('kibana_admin'),
  auth.hasFireDepartment,
  proxy(settings)
);

module.exports = router;
