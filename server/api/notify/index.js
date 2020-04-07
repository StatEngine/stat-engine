'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './notify.controller';

const router = new Router();

router.post(
  '/',
  bodyParser.json(),
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  controller.notify,
);

module.exports = router;

export default router;
