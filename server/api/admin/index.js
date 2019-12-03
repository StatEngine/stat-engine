'use strict';

import { Router } from 'express';
import * as controller from './admin.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.post(
  '/refreshAllSubscriptions',
  auth.isApiAuthenticated,
  auth.hasRole('admin'),
  controller.refreshAllSubscriptions,
);

module.exports = router;

