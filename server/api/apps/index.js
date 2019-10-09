'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './apps.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.search)
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.get)
);

router.get(
  '/:id/status',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.status)
);

router.post(
  '/:id/install',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.install)
);

router.post(
  '/:id/uninstall',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.uninstall)
);

module.exports = router;
