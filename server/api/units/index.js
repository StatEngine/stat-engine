'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './units.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.setIndex,
  controller.buildQuery,
  controller.searchUnits,
);

module.exports = router;

export default router;
