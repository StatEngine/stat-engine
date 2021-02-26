'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './workspace.controller';
import * as auth from '../../auth/auth.service';
import { KibanaApi } from '../../kibana/kibana-api';

const router = new Router();

const defaultAuth = [
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
];

router.post(
  '/',
  ...defaultAuth,
  bodyParser.json(),
  controller.create,
);

router.get(
  '/',
  ...defaultAuth,
  controller.getAll,
);

router.get(
  '/:id',
  ...defaultAuth,
  controller.hasWorkspaceAccess,
  KibanaApi.connect,
  controller.get,
);

router.put(
  '/:id',
  ...defaultAuth,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  KibanaApi.connect,
  controller.edit,
);

router.delete(
  '/:id',
  ...defaultAuth,
  controller.hasWorkspaceOwnerAccess,
  controller.markAsDeleted,
);

router.delete(
  '/:id/users/:userId',
  bodyParser.json(),
  ...defaultAuth,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeUser,
);

router.post(
  '/:id/users/:userId',
  ...defaultAuth,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateUser,
);

router.post(
  '/:id/owners/:userId',
  ...defaultAuth,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.updateOwner,
);

router.delete(
  '/:id/owners/:userId',
  bodyParser.json(),
  ...defaultAuth,
  bodyParser.json(),
  controller.hasWorkspaceOwnerAccess,
  controller.revokeOwner,
);

router.param('id', controller.load);

module.exports = router;
