import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import { getEmailHtmlController } from './getEmailHtmlController';


const router = new Router();

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
