'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './shift.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasPermission('shift:read'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getShift
);

module.exports = router;
