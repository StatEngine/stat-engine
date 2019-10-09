'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './weather.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/forecast/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getForecast)
);

module.exports = router;
