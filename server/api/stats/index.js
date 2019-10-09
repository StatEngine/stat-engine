'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './stats.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getStats)
);

module.exports = router;

export default router;
