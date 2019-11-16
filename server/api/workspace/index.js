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
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.create,
  controller.loadFixtures,
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.getAll
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.hasWorkspaceAccess,
  controller.get
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.edit
);

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.hasWorkspaceOwnerAccess,
  controller.markAsDeleted,
);

router.delete(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeUser,
);

router.post(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateUser,
);

router.post(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateOwner
);

router.delete(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeOwner,
);

router.param('id', controller.load);

module.exports = router;
