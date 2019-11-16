'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import * as controller from './chargebee.controller';

const router = new Router();

router.post(
  '/webhook',
  bodyParser.json(),
  controller.webhook,
);

module.exports = router;
