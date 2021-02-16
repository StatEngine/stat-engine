import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './custom-email.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

const defaultAuth = [
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
];

router.get(
  '/',
  ...defaultAuth,
  controller.listByDeptId,
);

router.get(
  '/:emailId',
  ...defaultAuth,
  controller.find,
);

router.post(
  '/',
  ...defaultAuth,
  controller.create,
);

router.put(
  '/:emailId',
  ...defaultAuth,
  controller.updateCustomEmail,
);

router.delete(
  '/:emailId',
  ...defaultAuth,
  controller.deleteCustomEmail,
);

router.post(
  '/:emailId/preview',
  ...defaultAuth,
  controller.preview,
);

module.exports = router;
