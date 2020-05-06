'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './personnel.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.search,
);

module.exports = router;

export default router;
