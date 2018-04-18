'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

// authenticated routes
router.get('/me', auth.isApiAuthenticated, controller.me);
router.put('/:id', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, controller.edit);
router.put('/:id/password', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, controller.changePassword);
router.put('/:id/requestAccess', auth.isApiAuthenticated, bodyParser.json(), controller.hasEditPermisssion, controller.requestAccess);
router.param('id', controller.loadUser);

// department admin routes
router.get('/', auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.index);
router.get('/:id', auth.isApiAuthenticated, auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.get);
router.put('/:id/revokeAccess', bodyParser.json(), auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.hasEditPermisssion, controller.revokeAccess);
router.put('/:id/approveAccess', bodyParser.json(), auth.isApiAuthenticated, auth.hasRole('department_admin'), controller.hasEditPermisssion, controller.approveAccess);

// unprotected routes
router.post('/', bodyParser.json(), controller.create);
router.put('/resetPassword', bodyParser.json(), controller.resetPassword);
router.put('/updatePassword', bodyParser.json(), controller.updatePassword);

module.exports = router;
