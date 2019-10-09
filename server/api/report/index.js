'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './report.controller';
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
  '/:type/:name',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.get)
);

router.put(
  '/:type/:name',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.upsert)
);

router.post(
  '/:type/:name/notify',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.findReport),
  asyncMiddleware(controller.loadNofiticationDestinations),
  asyncMiddleware(controller.notify)
);

router.get(
  '/:type/:name/metrics',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.findReport),
  asyncMiddleware(controller.getMetrics),
);

router.post(
  '/:type/:name/views',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.findReport),
  asyncMiddleware(controller.view)
);

module.exports = router;
