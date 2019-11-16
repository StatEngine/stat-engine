'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './safety.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getRandomMessage
);

module.exports = router;

export default router;
