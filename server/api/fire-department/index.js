'use strict';

import {Router} from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './fire-department.controller';

const router = new Router();
const rawParser = bodyParser.raw({
  inflate: true,
  limit: '5mb',
  type: 'application/octet-stream',

});

router.get('/', controller.index);
router.get('/:firecaresId', controller.show);

router.put('/:firecaresId/:type/:id',
  auth.isAuthenticated,
  auth.hasRole('ingest'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  rawParser,
  controller.queueIngest);

module.exports = router;
