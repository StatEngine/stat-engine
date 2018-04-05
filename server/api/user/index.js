'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isApiAuthenticated, auth.hasRole('admin'), controller.index);
router.post('/', bodyParser.json(), controller.create);
router.delete('/:id', auth.isApiAuthenticated, auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isApiAuthenticated, controller.me);
router.put('/:id/password', bodyParser.json(), auth.isApiAuthenticated, controller.changePassword);
router.put('/resetpassword', bodyParser.json(), controller.resetPassword);
router.put('/updatepassword', bodyParser.json(), controller.updatePassword);
router.get('/:id', auth.isApiAuthenticated, controller.show);
router.post('/:id', bodyParser.json(), controller.edit);

module.exports = router;
