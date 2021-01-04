import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './email.controller';
import sendNotificationController from './sendNotificationController';
import { getEmailHtmlController } from './getEmailHtmlController';


const router = new Router();

router.post(
  '/timeRangeAnalysis',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  controller.sendTimeRangeAnalysis,
);

router.post(
  '/v2/timeRangeAnalysis',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  sendNotificationController,
);

router.post(
  '/v2/getEmailHtml',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  getEmailHtmlController,
);

module.exports = router;

export default router;
