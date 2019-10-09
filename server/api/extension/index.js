'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './extension.controller';
import { asyncMiddleware } from '../../util/async-middleware';
import { asyncParam } from '../../util/async-param';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.search)
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.get)
);

router.get(
  '/:id/request',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.findRequest)
);

router.put(
  '/:id/request',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(controller.request)
);

router.param('id', asyncParam(controller.loadExtension));

module.exports = router;
