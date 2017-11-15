'use strict';

import {Router} from 'express';
import * as controller from './fire-department.controller';
import * as auth from '../../auth/auth.service';
import bodyParser from 'body-parser';

var router = new Router();

router.get('/', controller.index);
router.get('/:id', controller.show);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/', auth.hasRole('admin'), bodyParser.json(), controller.create);

module.exports = router;
