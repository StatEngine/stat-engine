'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';

import * as auth from '../../auth/auth.service';
import * as controller from './safety.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getRandomMessage
);

module.exports = router;
