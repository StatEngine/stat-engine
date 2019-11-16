'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './weather.controller';

const router = new Router();

router.get(
  '/forecast/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.getForecast
);

module.exports = router;
