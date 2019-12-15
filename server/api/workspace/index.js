'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './workspace.controller';
import * as auth from '../../auth/auth.service';
import { KibanaApi } from '../../kibana/kibana-api';

const router = new Router();

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.create,
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
  KibanaApi.connect,
  controller.get,
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  KibanaApi.connect,
  controller.edit,
);

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  controller.hasWorkspaceOwnerAccess,
  controller.markAsDeleted,
);

router.delete(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeUser,
);

router.post(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateUser,
);

router.post(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateOwner
);

router.delete(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeOwner,
);

router.param('id', controller.load);

module.exports = router;
