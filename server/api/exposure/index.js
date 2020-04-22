'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './exposure.controller';

const router = new Router();

router.get(
  '/iac',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.authenticateNFORS,
  auth.hasFireDepartment,
  controller.exposure,
);

module.exports = router;

export default router;
