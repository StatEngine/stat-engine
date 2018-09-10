'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './unit-reports.controller';

const router = new Router();

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
//  controller.generateUnitReport,
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  //controller.getRecentIncidents,
);

router.param('id', controller.loadUnit);

module.exports = router;

export default router;
