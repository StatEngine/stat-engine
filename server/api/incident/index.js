'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './incident.controller';

const router = new Router();

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getIncident,
);

/*router.get(
  '/:id/analysis',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getIncident,
);*/

router.param('id', controller.loadIncident);


module.exports = router;

export default router;
