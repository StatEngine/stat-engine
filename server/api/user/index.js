'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { asyncMiddleware } from '../../util/async-middleware';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

// unprotected routes
router.post('/', bodyParser.json(), asyncMiddleware(controller.create));
router.put('/requestUsername', bodyParser.json(), controller.requestUsername);
router.put('/resetPassword', bodyParser.json(), controller.resetPassword);
router.put('/updatePassword', bodyParser.json(), controller.updatePassword);

// authenticated routes
router.get('/', auth.isApiAuthenticated, auth.hasFireDepartment, controller.departmentUsers);
router.get('/me', auth.isApiAuthenticated, controller.me);
router.put('/:id', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, controller.edit);
router.put('/:id/password', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, controller.changePassword);
router.put('/:id/requestAccess', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, asyncMiddleware(controller.requestAccess));
router.param('id', controller.loadUser);

// department admin routes
router.get('/', auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.index);
router.get('/:id', auth.isApiAuthenticated, auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.get);
router.put('/:id/revokeAccess', bodyParser.json(), auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.hasEditPermisssion, asyncMiddleware(controller.revokeAccess));
router.put('/:id/approveAccess', bodyParser.json(), auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.hasEditPermisssion, asyncMiddleware(controller.approveAccess));

module.exports = router;
