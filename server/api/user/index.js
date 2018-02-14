'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isApiAuthenticated, auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.isApiAuthenticated, auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isApiAuthenticated, controller.me);
router.put('/:id/password', auth.isApiAuthenticated, controller.changePassword);
router.get('/:id', auth.isApiAuthenticated, controller.show);
router.post('/', bodyParser.json(), controller.create);

module.exports = router;
