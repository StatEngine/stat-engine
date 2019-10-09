'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './incident.controller';
import { asyncMiddleware } from '../../util/async-middleware';
import { asyncParam } from '../../util/async-param';

const router = new Router();

router.get(
  '/active',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getActiveIncidents),
);

router.get(
  '/top',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getTopIncidents),
);

router.get(
  '/summary',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getSummary),
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.loadMatrix),
  asyncMiddleware(controller.loadComparison),
  asyncMiddleware(controller.loadConcurrent),
  asyncMiddleware(controller.getIncident),
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getIncidents),
);

router.param('id', asyncParam(controller.loadIncident));

module.exports = router;

export default router;
