'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './email-list.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.emailList,
);

module.exports = router;
