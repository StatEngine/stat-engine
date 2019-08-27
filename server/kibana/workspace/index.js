'use strict';

import { Router } from 'express';
import connectEnsureLoggedIn from 'connect-ensure-login';

import * as auth from '../../auth/auth.service';
import * as rorController from './read-only-rest.controller';
import * as kibanaRest from './kibana-rest.controller';
import * as workspaceController from '../../api/workspace/workspace.controller';
import { asyncMiddleware } from '../../util/async-middleware';
import kibanaApi from '../kibana-api';

const ensureLoggedIn = connectEnsureLoggedIn.ensureLoggedIn;

const router = new Router();

router.get(
  '/:id/api',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  workspaceController.hasWorkspaceAccess,
  asyncMiddleware(kibanaApi.connectMiddleware),
  asyncMiddleware(kibanaRest.testApiCall),
);

router.get(
  '/:id/dashboard',
  ensureLoggedIn('/login'),
  auth.isAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  workspaceController.hasWorkspaceAccess,
  rorController.logout,
  rorController.login,
);

router.param('id', workspaceController.load);

module.exports = router;
