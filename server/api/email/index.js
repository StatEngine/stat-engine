'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './email.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.post(
  '/timeRangeAnalysis',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  asyncMiddleware(controller.sendTimeRangeAnalysis),
);

module.exports = router;

export default router;
