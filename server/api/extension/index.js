'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './extension.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.get
);

router.put(
  '/:id/request',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.request
);

router.param('id', controller.loadExtension);

module.exports = router;
