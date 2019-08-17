'use strict';

import { Router } from 'express';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './fixture-template.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.get(
  '/dashboards',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  asyncMiddleware(controller.getDashboards),
);

module.exports = router;

