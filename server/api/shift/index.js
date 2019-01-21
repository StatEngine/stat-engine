'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './shift.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasPermission('shift:read'),
  auth.hasFireDepartment,
  controller.getShift
);

module.exports = router;
