import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import { getEmailHtmlController } from './getEmailHtmlController';
import { emailController, customEmailController } from './emailController';

const router = new Router();

router.post(
  '/getEmailHtml',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  getEmailHtmlController,
);

router.post(
  '/customEmail',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  customEmailController,
);

router.post(
  '/notificationEmail',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  emailController,
);

module.exports = router;

export default router;
