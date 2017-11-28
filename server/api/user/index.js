'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';
import bodyParser from 'body-parser';

var router = new Router();

router.get('/', auth.isAuthenticated, auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.isAuthenticated, auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated, controller.me);
router.put('/:id/password', auth.isAuthenticated, controller.changePassword);
router.get('/:id', auth.isAuthenticated, controller.show);
router.post('/', bodyParser.json(), controller.create);

module.exports = router;
