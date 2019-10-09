'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './safety.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getRandomMessage)
);

module.exports = router;

export default router;
