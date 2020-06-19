'use strict';

import { Router } from 'express';

import * as controller from './firecares.controller';
import * as auth from '../../../auth/auth.service';

const router = new Router();

router.get(
  '/department/:firecares_id',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  controller.getDepartment
);

module.exports = router;
