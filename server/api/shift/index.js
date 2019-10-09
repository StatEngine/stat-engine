'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './shift.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasPermission('shift:read'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getShift)
);

module.exports = router;
