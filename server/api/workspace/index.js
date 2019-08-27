'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './workspace.controller';
import * as auth from '../../auth/auth.service';
import kibanaApi from '../../kibana/kibana-api';

const router = new Router();

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.create),
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  asyncMiddleware(controller.getAll)
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  asyncMiddleware(controller.hasWorkspaceAccess),
  asyncMiddleware(kibanaApi.connectMiddleware),
  asyncMiddleware(controller.get)
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(kibanaApi.connectMiddleware),
  asyncMiddleware(controller.edit)
);

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.markAsDeleted),
);

router.delete(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.revokeUser),
);

router.post(
  '/:id/users/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.updateUser),
);

router.post(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.updateOwner)
);

router.delete(
  '/:id/owners/:userId',
  auth.isApiAuthenticated,
  auth.hasRole('dashboard_user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  asyncMiddleware(controller.hasWorkspaceOwnerAccess),
  asyncMiddleware(controller.revokeOwner),
);

router.param('id', controller.load);

module.exports = router;
