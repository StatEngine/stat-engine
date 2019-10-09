'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './workspace.controller';
import * as auth from '../../auth/auth.service';
import { asyncParam } from '../../util/async-param';

var router = new Router();

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.create),
  asyncMiddleware(controller.loadFixtures),
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getAll)
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.hasWorkspaceAccess),
  asyncMiddleware(controller.get)
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.edit)
);

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.markAsDeleted),
);

router.delete(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.revokeUser),
);

router.post(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.updateUser),
);

router.post(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.updateOwner)
);

router.delete(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.revokeOwner),
);

router.param('id', asyncParam(controller.load));

module.exports = router;
