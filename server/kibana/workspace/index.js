'use strict';

import { Router } from 'express';
import connectEnsureLoggedIn from 'connect-ensure-login';
import proxy from 'http-proxy-middleware';

import * as auth from '../../auth/auth.service';
import * as rorController from './read-only-rest.controller';
import * as workspaceController from '../../api/workspace/workspace.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn;

const router = new Router();

router.get(
  '/:id/dashboard',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  workspaceController.hasWorkspaceAccess,
  asyncMiddleware(rorController.login),
);

router.get(
  '/:id/login',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  workspaceController.hasWorkspaceAccess,
  asyncMiddleware(rorController.login),
);

router.param('id', workspaceController.load);

module.exports = router;
