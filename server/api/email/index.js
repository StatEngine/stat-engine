import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import { emailController, customEmailController } from './emailController';

const router = new Router();

const defaultAuth = [
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  auth.hasFireDepartment,
  bodyParser.json(),
];

router.post(
  '/customEmail',
  ...defaultAuth,
  customEmailController,
);

router.post(
  '/notificationEmail',
  ...defaultAuth,
  emailController,
);

module.exports = router;
