'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './extension-configuration.controller';

const router = new Router();

console.dir(controller)
console.dir('in heeeer')
router.get('/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.search);

module.exports = router;
