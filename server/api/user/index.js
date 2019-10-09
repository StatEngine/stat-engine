'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';
import { asyncParam } from '../../util/async-param';

var router = new Router();

// unprotected routes
router.post(
  '/',
  bodyParser.json(),
  asyncMiddleware(controller.create),
);

router.put(
  '/requestUsername',
  bodyParser.json(),
  asyncMiddleware(controller.requestUsername),
);

router.put(
  '/resetPassword',
  bodyParser.json(),
  asyncMiddleware(controller.resetPassword),
);

router.put(
  '/updatePassword',
  bodyParser.json(),
  asyncMiddleware(controller.updatePassword),
);

// authenticated routes
router.get(
  '/',
  auth.isApiAuthenticated,
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getAll),
);

router.get(
  '/me',
  auth.isApiAuthenticated,
  asyncMiddleware(controller.me),
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  bodyParser.json(),
  asyncMiddleware(controller.hasEditPermisssion),
  asyncMiddleware(controller.edit),
);

router.put(
  '/:id/password',
  auth.isApiAuthenticated,
  bodyParser.json(),
  asyncMiddleware(controller.hasEditPermisssion),
  asyncMiddleware(controller.changePassword),
);

router.put(
  '/:id/requestAccess',
  auth.isApiAuthenticated,
  bodyParser.json(),
  asyncMiddleware(controller.hasEditPermisssion),
  asyncMiddleware(controller.requestAccess),
);

router.param('id', asyncParam(controller.loadUser));

// department admin routes
router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(controller.get),
);

router.put(
  '/:id/revokeAccess',
  bodyParser.json(),
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(controller.hasEditPermisssion),
  asyncMiddleware(controller.revokeAccess),
);

router.put(
  '/:id/approveAccess',
  bodyParser.json(),
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  asyncMiddleware(controller.hasEditPermisssion),
  asyncMiddleware(controller.approveAccess),
);

module.exports = router;
