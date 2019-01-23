'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './apps.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.search
);

module.exports = router;
