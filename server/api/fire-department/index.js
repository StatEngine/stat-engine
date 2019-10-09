'use strict';

import {Router} from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';

import * as controller from './fire-department.controller';
import { asyncMiddleware } from '../../util/async-middleware';
import { asyncParam } from '../../util/async-param';

const router = new Router();

router.get(
  '/',
  asyncMiddleware(controller.search)
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.get)
);

router.get(
  '/:id/users',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getUsers)
);

router.post(
  '/',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  asyncMiddleware(controller.create)
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  asyncMiddleware(controller.edit)
);

router.get(
  '/:id/:type/data-quality',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.hasAdminPermission),
  asyncMiddleware(controller.dataQuality)
);

router.get(
  '/:id/:type/nfpa',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.hasReadPermission),
  asyncMiddleware(controller.nfpa)
);

router.get(
  '/:id/subscription',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getSubscription),
);

router.param('id', asyncParam(controller.loadFireDepartment));

module.exports = router;
