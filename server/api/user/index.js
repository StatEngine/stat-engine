'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

// admin routes
router.get('/', auth.isApiAuthenticated, auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.isApiAuthenticated, auth.hasRole('admin'), controller.destroy);

// authenticated routes
router.get('/me', auth.isApiAuthenticated, controller.me);
router.get('/:id', auth.isApiAuthenticated, controller.hasEditPermisssion, controller.show);
router.put('/:id', bodyParser.json(), auth.isApiAuthenticated, controller.hasEditPermisssion, controller.edit);
router.put('/:id/password', bodyParser.json(), auth.isApiAuthenticated, controller.hasEditPermisssion, controller.changePassword);
router.put('/:id/requestAccess', bodyParser.json(), auth.isApiAuthenticated, controller.hasEditPermisssion, controller.requestAccess);

// unprotected routes
router.post('/', bodyParser.json(), controller.create);
router.put('/resetPassword', bodyParser.json(), controller.resetPassword);
router.put('/updatePassword', bodyParser.json(), controller.updatePassword);

module.exports = router;
