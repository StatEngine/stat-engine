'use strict';

import { Router } from 'express';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './admin.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.post(
  '/addFixtureTemplatesToDatabase',
  auth.isApiAuthenticated,
  auth.hasRole('admin'),
  asyncMiddleware(controller.addFixtureTemplatesToDatabase),
);

module.exports = router;

