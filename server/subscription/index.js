'use strict';

import { Router } from 'express';
import connectEnsureLoggedIn from 'connect-ensure-login';
import { subscriptionPortal } from './subscription.controller';
import * as auth from '../auth/auth.service';

const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn;

const router = new Router();

router.use(
  '*',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('department_admin'),
  subscriptionPortal,
);

module.exports = router;
