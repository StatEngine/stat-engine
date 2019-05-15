'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './workspace.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.create,
  controller.loadFixtures,
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.getAll
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceAccess,
  controller.get
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  bodyParser.json(),
  controller.edit
)

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  controller.markAsDeleted
)

router.delete(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  bodyParser.json(),
  controller.revokeUser,
);

router.post(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  bodyParser.json(),
  controller.updateUser
);

router.post(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  bodyParser.json(),
  controller.updateOwner
);

router.delete(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  bodyParser.json(),
  controller.revokeOwner,
);

router.param('id', controller.load);

module.exports = router;
