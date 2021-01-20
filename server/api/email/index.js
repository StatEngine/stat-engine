import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import { getEmailHtmlController } from './getEmailHtmlController';
import buildEmailContentAndSend from '../../lib/customEmails/buildEmailContentAndSend';


const router = new Router();

router.post(
  '/v2/getEmailHtml',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  getEmailHtmlController,
);

router.post(
  '/v2/customEmail',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  bodyParser.json(),
  auth.hasFireDepartment,
  buildEmailContentAndSend,
);
module.exports = router;

export default router;
